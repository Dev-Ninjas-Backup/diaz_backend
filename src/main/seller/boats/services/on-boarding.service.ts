import { HandleError } from '@/common/error/handle-error.decorator';
import { successResponse, TResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { StripeService } from '@/lib/stripe/stripe.service';
import { UtilsService } from '@/lib/utils/utils.service';
import { Injectable, Logger } from '@nestjs/common';
import {
  SellerOnboardingBodyDto,
  SellerOnboardingFilesDto,
} from '../dto/seller-on-boarding.dto';

@Injectable()
export class OnBoardingService {
  private readonly logger = new Logger(OnBoardingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService,
    private readonly stripe: StripeService,
  ) {}

  @HandleError('Failed to complete onboarding', 'Boats')
  async completeOnBoarding(
    data: SellerOnboardingBodyDto,
    files: SellerOnboardingFilesDto,
  ): Promise<TResponse<any>> {
    // TODO: Implement onboarding logic here
    return successResponse(
      {
        boatInfo: JSON.parse(JSON.stringify(data.boatInfo)),
        sellerInfo: JSON.parse(JSON.stringify(data.sellerInfo)),
        covers: files.covers?.map((file) => file.originalname) || [],
        galleries: files.galleries?.map((file) => file.originalname) || [],
      },
      'Onboarding completed successfully',
    );
  }
}
