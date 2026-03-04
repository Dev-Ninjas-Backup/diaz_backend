import { AppError } from '@/common/error/handle-error.app';
import { HandleError } from '@/common/error/handle-error.decorator';
import { successResponse, TResponse } from '@/common/utils/response.util';
import { PaywallCheckService } from '@/lib/paywall/paywall-check.service';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { QueueFile } from '@/lib/queue/interface/image-process.payload';
import { UtilsService } from '@/lib/utils/utils.service';
import { GetCustomBoatsService } from '@/main/shared/boats/services/get-custom-boats.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from 'generated/client';
import { UpdateListingDtoWithImagesDto } from '../dto/update-boats.dto';
import { BoatListingHelperService } from './boat-listing-helper.service';

@Injectable()
export class UpdateListingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paywallCheckService: PaywallCheckService,
    private readonly boatListingHelper: BoatListingHelperService,
    private readonly utils: UtilsService,
    private readonly getCustomBoatsService: GetCustomBoatsService,
  ) {}

  @HandleError('Error updating boat listing', 'BOAT')
  async updateListing(
    userId: string,
    boatId: string,
    files: QueueFile[],
    data?: UpdateListingDtoWithImagesDto,
  ): Promise<TResponse<any>> {
    // Validate paywall and get plan info
    const { plan, user } =
      await this.paywallCheckService.validateUserCanPost(userId);

    // Validate boat belongs to user
    const listing = await this.prisma.client.boats.findUniqueOrThrow({
      where: { id: boatId },
      include: {
        engines: true,
        images: {
          include: {
            file: true,
          },
        },
      },
    });

    if (listing.userId !== user.id) {
      throw new AppError(HttpStatus.FORBIDDEN, 'Boat does not belong to user');
    }

    const boatInfo = this.boatListingHelper.parseUpdateBoatInfo(data ?? {});

    const totalFiles =
      listing.images.length +
      files.length -
      (boatInfo?.imagesToDelete?.length ?? 0);

    // Validate image limit
    this.boatListingHelper.validateImageLimit(totalFiles, plan.picLimit);

    // Sync Boats Engines (map Prisma null to undefined for DTO compatibility)
    const existingEngines = listing.engines.map((e) => ({
      ...e,
      make: e.make ?? undefined,
      model: e.model ?? undefined,
      fuelType: e.fuelType ?? undefined,
      propellerType: e.propellerType ?? undefined,
    }));
    await this.boatListingHelper.syncBoatsEngines(
      boatId,
      existingEngines,
      boatInfo?.engines ?? [],
    );

    // Emit all events
    await this.boatListingHelper.emitAllBoatEvents(
      user.id,
      listing.id,
      boatInfo,
      files,
    );

    if (boatInfo?.imagesToDelete && boatInfo.imagesToDelete.length > 0) {
      await this.boatListingHelper.emitBoatImageDeleteEvent(
        user.id,
        listing.id,
        boatInfo?.imagesToDelete ?? [],
      );
    }

    // Convert dimensions if provided
    let dimensions = {};
    if (boatInfo.boatDimensions) {
      const { length, beam, draft } = this.boatListingHelper.convertDimensions(
        boatInfo.boatDimensions,
      );
      dimensions = { length, beam, draft };
    }

    // Build update data with nullish coalescing
    const updateData: Prisma.BoatsUpdateInput = {
      name: boatInfo.name ?? listing.name,
      price: boatInfo.price ?? listing.price,
      description: boatInfo.description?.trim() ?? listing.description,
      buildYear: boatInfo.buildYear ?? listing.buildYear,
      make: boatInfo.make ?? listing.make,
      model: boatInfo.model ?? listing.model,
      fuelType: boatInfo.fuelType ?? listing.fuelType,
      class: boatInfo.boatClass ?? listing.class,
      material: boatInfo.material ?? listing.material,
      condition: boatInfo.condition ?? listing.condition,
      engineType: boatInfo.engineType?.trim() ?? listing.engineType,
      propType: boatInfo.propType?.trim() ?? listing.propType,
      propMaterial: boatInfo.propMaterial?.trim() ?? listing.propMaterial,
      ...dimensions,
      enginesNumber: boatInfo.enginesNumber ?? listing.enginesNumber,
      cabinsNumber: boatInfo.cabinsNumber ?? listing.cabinsNumber,
      headsNumber: boatInfo.headsNumber ?? listing.headsNumber,
      city: boatInfo.city ?? listing.city,
      state: boatInfo.state ?? listing.state,
      zip: boatInfo.zip ?? listing.zip,
      electronics: boatInfo.electronics ?? listing.electronics,
      insideEquipment: boatInfo.insideEquipment ?? listing.insideEquipment,
      outsideEquipment: boatInfo.outsideEquipment ?? listing.outsideEquipment,
      electricalEquipment:
        boatInfo.electricalEquipment ?? listing.electricalEquipment,
      covers: boatInfo.coversEquipment ?? listing.covers,
      additionalEquipment:
        boatInfo.additionalEquipment ?? listing.additionalEquipment,
      videoURL: boatInfo.videoURL?.trim() ?? listing.videoURL,
      extraDetails: boatInfo.extraDetails?.length
        ? this.utils.safeParseJson(boatInfo.extraDetails, {})
        : this.utils.safeParseJson(listing.extraDetails, {}),
    };

    // Perform the update
    await this.prisma.client.boats.update({
      where: { id: boatId },
      data: updateData,
    });

    const boat = await this.getCustomBoatsService.getSingleBoat(boatId);

    return successResponse(boat.data, 'Successfully updated boat listing');
  }
}
