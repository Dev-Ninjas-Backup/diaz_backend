import { QueueEventsEnum } from '@/common/enum/queue-events.enum';
import { AppError } from '@/common/error/handle-error.app';
import { HandleError } from '@/common/error/handle-error.decorator';
import { ParseJsonPipe } from '@/common/pipe/parse-json.pipe';
import { successResponse, TResponse } from '@/common/utils/response.util';
import { PaywallCheckService } from '@/lib/paywall/paywall-check.service';
import { PrismaService } from '@/lib/prisma/prisma.service';
import {
  AdoptBoatsFeatures,
  AdoptBoatsSpecification,
} from '@/lib/queue/interface/adopt-boats-data.payload';
import { ListingImageProcessPayload } from '@/lib/queue/interface/image-process.payload';
import { UtilsService } from '@/lib/utils/utils.service';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BoatImageType } from '@prisma/client';
import { BoatEngineDto } from '../dto/boats.dto';
import { BoatListingDto } from '../dto/seller-on-boarding.dto';

@Injectable()
export class CreateListingService {
  private readonly logger = new Logger(CreateListingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService,
    private readonly eventEmitter: EventEmitter2,
    private readonly paywallCheckService: PaywallCheckService,
  ) {}

  @HandleError('Failed to create listing')
  async createListing(
    userId: string,
    data: BoatListingDto,
    files: { path: string; type: BoatImageType; originalName: string }[],
  ): Promise<TResponse<any>> {
    if (!data.boatInfo) {
      throw new AppError(HttpStatus.BAD_REQUEST, 'Boat info is required');
    }

    // Validate user's paywall access
    const { plan, user } =
      await this.paywallCheckService.validateUserCanPost(userId);

    // Validate image limit
    if (files.length > plan.picLimit) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        `You have exceeded the image upload limit for your plan (${plan.picLimit} allowed)`,
      );
    }

    this.logger.log(
      `Total uploaded images: ${files.length} (Plan limit: ${plan.picLimit})`,
    );

    const parsePipe = new ParseJsonPipe();
    const boatInfo = parsePipe.transform(data.boatInfo);

    this.logger.log('Boat Info parsed successfully', boatInfo);

    // Save boat listing to DB
    const {
      lengthFeet,
      lengthInches,
      beamFeet,
      beamInches,
      draftFeet,
      draftInches,
    } = boatInfo.boatDimensions;

    const decimalLength = this.utils.feetAndInchesToDecimal(
      lengthFeet,
      lengthInches,
    );
    const decimalBeam = this.utils.feetAndInchesToDecimal(beamFeet, beamInches);
    const decimalDraft = this.utils.feetAndInchesToDecimal(
      draftFeet,
      draftInches,
    );

    // * Create listing
    const listing = await this.prisma.boats.create({
      data: {
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
        length: decimalLength,
        beam: decimalBeam,
        draft: decimalDraft,
        enginesNumber: boatInfo.enginesNumber,
        cabinsNumber: boatInfo.cabinsNumber,
        headsNumber: boatInfo.headsNumber,
        city: boatInfo.city,
        state: boatInfo.state,
        zip: boatInfo.zip,
        status: 'ONBOARDING_PENDING',
        electronics: boatInfo.electronics || [],
        insideEquipment: boatInfo.insideEquipment || [],
        outsideEquipment: boatInfo.outsideEquipment || [],
        electricalEquipment: boatInfo.electricalEquipment || [],
        covers: boatInfo.covers || [],
        additionalEquipment: boatInfo.additionalEquipment || [],
        videoURL: boatInfo?.videoURL?.trim() || '',
        user: { connect: { id: user.id } },
        engines: boatInfo.engines?.length
          ? {
              createMany: {
                data: boatInfo.engines.map((engine: BoatEngineDto) => ({
                  ...engine,
                })),
              },
            }
          : undefined,
        extraDetails: boatInfo.extraDetails ?? [],
      },
      include: {
        engines: true,
        user: { select: { id: true, username: true, email: true } },
      },
    });

    // * Emit event to process uploaded images
    if (files && files.length > 0) {
      const payload: ListingImageProcessPayload = {
        userId: user.id,
        listingId: listing.id,
        files,
      };

      await this.eventEmitter.emitAsync(
        QueueEventsEnum.LISTING_IMAGE_PROCESSING,
        payload,
      );
    }

    // * Emit events to adopt new data of specification and features
    const adoptBoatsSpecificationPayload: AdoptBoatsSpecification = {
      listingId: listing.id,
      make: boatInfo.make,
      model: boatInfo.model,
      fuelType: boatInfo.fuelType,
      class: boatInfo.boatClass,
      material: boatInfo.material,
      condition: boatInfo.condition,
      engineType: boatInfo.engineType,
      propType: boatInfo.propType,
      propMaterial: boatInfo.propMaterial,
    };

    await this.eventEmitter.emitAsync(
      QueueEventsEnum.ADOPT_BOATS_SPECIFICATION,
      adoptBoatsSpecificationPayload,
    );

    const adoptBoatsFeaturesPayload: AdoptBoatsFeatures = {
      listingId: listing.id,
      electronics: boatInfo.electronics,
      insideEquipment: boatInfo.insideEquipment,
      outsideEquipment: boatInfo.outsideEquipment,
      electricalEquipment: boatInfo.electricalEquipment,
      covers: boatInfo.covers,
      additionalEquipment: boatInfo.additionalEquipment,
    };

    await this.eventEmitter.emitAsync(
      QueueEventsEnum.ADOPT_BOATS_FEATURES,
      adoptBoatsFeaturesPayload,
    );

    return successResponse(listing, 'Listing saved successfully');
  }
}
