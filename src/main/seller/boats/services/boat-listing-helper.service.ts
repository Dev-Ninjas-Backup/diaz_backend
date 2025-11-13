import { QueueEventsEnum } from '@/common/enum/queue-events.enum';
import { AppError } from '@/common/error/handle-error.app';
import { ParseJsonPipe } from '@/common/pipe/parse-json.pipe';
import { PrismaService } from '@/lib/prisma/prisma.service';
import {
  AdoptBoatsFeatures,
  AdoptBoatsSpecification,
} from '@/lib/queue/interface/adopt-boats-data.payload';
import {
  ListingImageProcessPayload,
  QueueFile,
} from '@/lib/queue/interface/image-process.payload';
import { UtilsService } from '@/lib/utils/utils.service';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BoatImageType, BoatListingStatus, Prisma } from '@prisma/client';
import { CreateBoatsInfoDto } from '../dto/boats-info.dto';
import { BoatEngineDto, UpdateBoatEngineDto } from '../dto/boats.dto';
import { UpdateListingDtoWithImagesDto } from '../dto/update-boats.dto';

@Injectable()
export class BoatListingHelperService {
  private readonly logger = new Logger(BoatListingHelperService.name);
  private readonly parsePipe = new ParseJsonPipe();

  constructor(
    private readonly utils: UtilsService,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // Parse boat info
  parseBoatInfo(boatInfoJson: CreateBoatsInfoDto): CreateBoatsInfoDto {
    const boatInfo = this.parsePipe.transform(boatInfoJson);
    this.logger.log('Boat Info parsed successfully');
    return boatInfo;
  }

  // Parse update boat info
  parseUpdateBoatInfo(
    boatInfoJson?: UpdateListingDtoWithImagesDto,
  ): UpdateListingDtoWithImagesDto {
    const boatInfo = this.parsePipe.transform(boatInfoJson);
    this.logger.log('Update Boat Info parsed successfully');
    return boatInfo;
  }

  // Convert boat dimensions
  convertDimensions(boatDimensions: CreateBoatsInfoDto['boatDimensions']) {
    const {
      lengthFeet,
      lengthInches,
      beamFeet,
      beamInches,
      draftFeet,
      draftInches,
    } = boatDimensions;

    return {
      length: this.utils.feetAndInchesToDecimal(lengthFeet, lengthInches),
      beam: this.utils.feetAndInchesToDecimal(beamFeet, beamInches),
      draft: this.utils.feetAndInchesToDecimal(draftFeet, draftInches),
    };
  }

  // Build boat create data
  buildBoatCreateData(
    boatInfo: CreateBoatsInfoDto,
    userId: string,
    status: BoatListingStatus,
  ): Prisma.BoatsCreateInput {
    const { length, beam, draft } = this.convertDimensions(
      boatInfo.boatDimensions,
    );

    return {
      name: boatInfo.name,
      price: boatInfo.price,
      description: boatInfo?.description?.trim() || '',
      buildYear: boatInfo.buildYear,
      make: boatInfo.make,
      model: boatInfo.model,
      fuelType: boatInfo.fuelType,
      class: boatInfo.boatClass,
      material: boatInfo.material,
      condition: boatInfo.condition,
      engineType: boatInfo?.engineType?.trim() || '',
      propType: boatInfo?.propType?.trim() || '',
      propMaterial: boatInfo?.propMaterial?.trim() || '',
      length,
      beam,
      draft,
      enginesNumber: boatInfo.enginesNumber,
      cabinsNumber: boatInfo.cabinsNumber,
      headsNumber: boatInfo.headsNumber,
      city: boatInfo.city,
      state: boatInfo.state,
      zip: boatInfo.zip,
      status,
      electronics: boatInfo.electronics || [],
      insideEquipment: boatInfo.insideEquipment || [],
      outsideEquipment: boatInfo.outsideEquipment || [],
      electricalEquipment: boatInfo.electricalEquipment || [],
      covers: boatInfo.coversEquipment || [],
      additionalEquipment: boatInfo.additionalEquipment || [],
      videoURL: boatInfo?.videoURL?.trim() || '',
      user: { connect: { id: userId } },
      engines: boatInfo.engines?.length
        ? {
            createMany: {
              data: boatInfo.engines.map((engine: BoatEngineDto) => ({
                ...engine,
              })),
            },
          }
        : undefined,
      extraDetails: boatInfo.extraDetails?.length
        ? JSON.stringify(boatInfo.extraDetails)
        : undefined,
    };
  }

  // Validate image limit
  validateImageLimit(filesCount: number, planLimit: number) {
    if (filesCount > planLimit) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        `You have exceeded the image upload limit for your plan (${planLimit} allowed)`,
      );
    }

    this.logger.log(
      `Total uploaded images: ${filesCount} (Plan limit: ${planLimit})`,
    );
  }

  // Emit image processing event
  async emitImageProcessingEvent(
    userId: string,
    listingId: string,
    files: { path: string; type: BoatImageType; originalName: string }[],
  ): Promise<void> {
    if (files && files.length > 0) {
      const payload: ListingImageProcessPayload = {
        userId,
        listingId,
        files,
      };

      await this.eventEmitter.emitAsync(
        QueueEventsEnum.LISTING_IMAGE_PROCESSING,
        payload,
      );

      this.logger.log(
        `Emitted image processing event for listing ${listingId} with ${files.length} files`,
      );
    }
  }

  // Sync boat engines
  async syncBoatsEngines(
    listingId: string,
    existingEngines: UpdateBoatEngineDto[],
    updatedEngines: UpdateBoatEngineDto[],
  ) {
    // Extract IDs
    const previousIds = existingEngines.map((e) => e.id).filter(Boolean);
    const updatedIds = updatedEngines.map((e) => e.id).filter(Boolean);

    // Identify what to delete
    const enginesToDelete = previousIds.filter(
      (id) => !updatedIds.includes(id),
    );

    await this.prisma.$transaction(async (tx) => {
      // Delete removed engines
      if (enginesToDelete.length > 0) {
        await tx.boatEngine.deleteMany({
          where: { boatId: listingId, id: { in: enginesToDelete } },
        });
        this.logger.log(`Deleted ${enginesToDelete.length} engines`);
      }

      // Update existing engines
      const enginesToUpdate = updatedEngines.filter((e) => e.id);
      for (const updated of enginesToUpdate) {
        const existing = existingEngines.find((e) => e.id === updated.id);
        if (!existing) {
          throw new AppError(
            HttpStatus.BAD_REQUEST,
            `Invalid engine ID: ${updated.id}. It does not belong to this boat.`,
          );
        }

        const data = {
          hours: updated.hours ?? existing.hours,
          horsepower: updated.horsepower ?? existing.horsepower,
          make: updated.make ?? existing.make,
          model: updated.model ?? existing.model,
          fuelType: updated.fuelType ?? existing.fuelType,
          propellerType: updated.propellerType ?? existing.propellerType,
        };

        await tx.boatEngine.update({
          where: { id: updated.id },
          data,
        });
      }

      // Create new engines (no id provided)
      const enginesToCreate = updatedEngines.filter((e) => !e.id);
      if (enginesToCreate.length > 0) {
        await tx.boatEngine.createMany({
          data: enginesToCreate.map((e) => ({
            boatId: listingId,
            hours: e.hours ?? 0,
            horsepower: e.horsepower ?? 0,
            make: e.make ?? '',
            model: e.model ?? '',
            fuelType: e.fuelType ?? '',
            propellerType: e.propellerType ?? '',
          })),
        });

        this.logger.log(`Created ${enginesToCreate.length} engines`);
      }
    });
  }

  // Emit boat specification adoption event
  async emitBoatSpecificationEvent(
    listingId: string,
    boatInfo: CreateBoatsInfoDto | UpdateListingDtoWithImagesDto,
  ): Promise<void> {
    const payload: AdoptBoatsSpecification = {
      listingId,
      make: boatInfo.make || '',
      model: boatInfo.model || '',
      fuelType: boatInfo.fuelType || '',
      class: boatInfo.boatClass || '',
      material: boatInfo.material || '',
      condition: boatInfo.condition || '',
      engineType: boatInfo.engineType || '',
      propType: boatInfo.propType || '',
      propMaterial: boatInfo.propMaterial || '',
    };

    await this.eventEmitter.emitAsync(
      QueueEventsEnum.ADOPT_BOATS_SPECIFICATION,
      payload,
    );

    this.logger.log(
      `Emitted boat specification event for listing ${listingId}`,
    );
  }

  // Emit boat features adoption event
  async emitBoatFeaturesEvent(
    listingId: string,
    boatInfo: CreateBoatsInfoDto | UpdateListingDtoWithImagesDto,
  ): Promise<void> {
    const payload: AdoptBoatsFeatures = {
      listingId,
      electronics: boatInfo.electronics || [],
      insideEquipment: boatInfo.insideEquipment || [],
      outsideEquipment: boatInfo.outsideEquipment || [],
      electricalEquipment: boatInfo.electricalEquipment || [],
      covers: boatInfo.coversEquipment || [],
      additionalEquipment: boatInfo.additionalEquipment || [],
    };

    await this.eventEmitter.emitAsync(
      QueueEventsEnum.ADOPT_BOATS_FEATURES,
      payload,
    );

    this.logger.log(`Emitted boat features event for listing ${listingId}`);
  }

  // Emit all boat events
  async emitAllBoatEvents(
    userId: string,
    listingId: string,
    boatInfo: CreateBoatsInfoDto | UpdateListingDtoWithImagesDto,
    files: QueueFile[],
  ): Promise<void> {
    await Promise.all([
      this.emitImageProcessingEvent(userId, listingId, files),
      this.emitBoatSpecificationEvent(listingId, boatInfo),
      this.emitBoatFeaturesEvent(listingId, boatInfo),
    ]);
  }
}
