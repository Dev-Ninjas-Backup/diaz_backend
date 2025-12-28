import { AppError } from '@/common/error/handle-error.app';
import { HandleError } from '@/common/error/handle-error.decorator';
import { successResponse, TResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { QueueFile } from '@/lib/queue/interface/image-process.payload';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { BoatListingDto } from '@/main/seller/boats/dto/boats.dto';
import { AdminBoatListingHelperService } from './adminboat-listing-helper.service';

@Injectable()
export class AdminCreateListingService {
  private readonly logger = new Logger(AdminCreateListingService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly boatListingHelper: AdminBoatListingHelperService,
  ) {}

  @HandleError('Failed to create listing')
  async admincreateListing(
    userId: string,
    data: BoatListingDto,
    files: QueueFile[],
  ): Promise<TResponse<any>> {
    if (!data.boatInfo) {
      throw new AppError(HttpStatus.BAD_REQUEST, 'Boat info is required');
    }

    // Get user info (no subscription check for admin)
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(HttpStatus.NOT_FOUND, 'User not found');
    }

    // No image limit validation for admin (or use a high limit like 75)
    // this.boatListingHelper.validateImageLimit(files.length, 75);

    // Parse boat info
    const boatInfo = this.boatListingHelper.parseBoatInfo(data.boatInfo);

    // Create listing
    const listing = await this.prisma.client.$transaction(async (tx) => {
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
