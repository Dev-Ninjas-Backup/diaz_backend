import { AppError } from '@/common/error/handle-error.app';
import { HandleError } from '@/common/error/handle-error.decorator';
import { ParseJsonPipe } from '@/common/pipe/parse-json.pipe';
import { successResponse, TResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { UtilsService } from '@/lib/utils/utils.service';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BoatImageType } from '@prisma/client';
import { BoatListingDto } from '../dto/seller-on-boarding.dto';

@Injectable()
export class CreateListingService {
  private readonly logger = new Logger(CreateListingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService,
    private readonly eventEmitter: EventEmitter2,
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

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.currentPlanId) {
      throw new AppError(
        HttpStatus.UNAUTHORIZED,
        'User is not allowed to post',
      );
    }

    //* Validate plan id
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: user?.currentPlanId },
    });

    if (!plan) {
      throw new AppError(HttpStatus.BAD_REQUEST, 'Subscription is not active');
    }

    this.logger.log(`Selected subscription plan: ${plan.title} (${plan.id})`);

    // * Validated total files number based on plan limit
    if (files.length > plan.picLimit) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        `You have exceeded the image upload limit for your plan (${plan.picLimit} images allowed)`,
      );
    }

    this.logger.log(
      `Total uploaded images: ${files.length} (Plan limit: ${plan.picLimit})`,
    );

    const parsePipe = new ParseJsonPipe();

    const boatInfo = parsePipe.transform(data.boatInfo);
    this.logger.log('Boat Info: ', boatInfo);

    return successResponse(
      {
        files: files,
        count: files.length,
        boatInfo,
      },
      'Files uploaded successfully',
    );
  }
}
