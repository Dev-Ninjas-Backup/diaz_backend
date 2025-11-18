import { AppError } from '@/common/error/handle-error.app';
import { HandleError } from '@/common/error/handle-error.decorator';
import { successResponse, TResponse } from '@/common/utils/response.util';
import { PaywallCheckService } from '@/lib/paywall/paywall-check.service';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { QueueFile } from '@/lib/queue/interface/image-process.payload';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { BoatListingDto } from '../dto/boats.dto';
import { BoatListingHelperService } from './boat-listing-helper.service';

@Injectable()
export class CreateListingService {
  private readonly logger = new Logger(CreateListingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paywallCheckService: PaywallCheckService,
    private readonly boatListingHelper: BoatListingHelperService,
  ) {}

  @HandleError('Failed to create listing')
  async createListing(
    userId: string,
    data: BoatListingDto,
    files: QueueFile[],
  ): Promise<TResponse<any>> {
    if (!data.boatInfo) {
      throw new AppError(HttpStatus.BAD_REQUEST, 'Boat info is required');
    }

    // Validate paywall and get plan info
    const { plan, user } =
      await this.paywallCheckService.validateUserCanPost(userId);

    // Validate image limit
    this.boatListingHelper.validateImageLimit(files.length, plan.picLimit);

    // Parse boat info
    const boatInfo = this.boatListingHelper.parseBoatInfo(data.boatInfo);

    // Create listing
    const listing = await this.prisma.$transaction(async (tx) => {
      return tx.boats.create({
        data: await this.boatListingHelper.buildBoatCreateData(
          boatInfo,
          user.id,
          'ACTIVE',
          tx,
        ),
        include: {
          engines: true,
          user: { select: { id: true, username: true, email: true } },
        },
      });
    });

    // Emit all events
    await this.boatListingHelper.emitAllBoatEvents(
      user.id,
      listing.id,
      boatInfo,
      files,
    );

    return successResponse(listing, 'Listing saved successfully');
  }
}
