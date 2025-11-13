import { AppError } from '@/common/error/handle-error.app';
import { HandleError } from '@/common/error/handle-error.decorator';
import { successResponse, TResponse } from '@/common/utils/response.util';
import { PaywallCheckService } from '@/lib/paywall/paywall-check.service';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { QueueFile } from '@/lib/queue/interface/image-process.payload';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UpdateListingDtoWithImagesDto } from '../dto/update-boats.dto';
import { BoatListingHelperService } from './boat-listing-helper.service';

@Injectable()
export class UpdateListingService {
  private readonly logger = new Logger(UpdateListingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paywallCheckService: PaywallCheckService,
    private readonly boatListingHelper: BoatListingHelperService,
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
    const listing = await this.prisma.boats.findUniqueOrThrow({
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

    // Sync Boats Engines
    await this.boatListingHelper.syncBoatsEngines(
      boatId,
      listing.engines,
      boatInfo?.engines ?? [],
    );

    // Emit all events
    await this.boatListingHelper.emitAllBoatEvents(
      user.id,
      listing.id,
      boatInfo,
      files,
    );

    this.logger.log(
      `[UPDATE LISTING] boatId: ${boatId}. boatInfo: ${JSON.stringify(boatInfo, null, 2)} FILES: ${files.length}`,
    );

    return successResponse(null, 'Successfully updated boat listing');
  }
}
