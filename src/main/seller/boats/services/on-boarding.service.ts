import { HandleError } from '@/common/error/handle-error.decorator';
import { successResponse, TResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { StripeService } from '@/lib/stripe/stripe.service';
import { UtilsService } from '@/lib/utils/utils.service';
import { Injectable, Logger } from '@nestjs/common';
import {
  SellerOnBoardingDto,
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
    data: SellerOnBoardingDto,
    files: SellerOnboardingFilesDto,
  ): Promise<TResponse<any>> {
    this.logger.log('Completing onboarding with data: ' + JSON.stringify(data));
    this.logger.log('Received files: ' + JSON.stringify(files));
    // Implement onboarding logic here
    return successResponse(null, 'Onboarding completed successfully');
  }
}
