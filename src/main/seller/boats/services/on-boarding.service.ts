import { HandleError } from '@/common/error/handle-error.decorator';
import { successResponse, TResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { StripeService } from '@/lib/stripe/stripe.service';
import { UtilsService } from '@/lib/utils/utils.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class OnBoardingService {
  private readonly logger = new Logger(OnBoardingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService,
    private readonly stripe: StripeService,
  ) {}

  @HandleError('Failed to complete onboarding', 'Boats')
  async completeOnBoarding(data: any): Promise<TResponse<any>> {
    this.logger.log('Completing onboarding with data: ' + JSON.stringify(data));
    // Implement onboarding logic here
    return successResponse(null, 'Onboarding completed successfully');
  }
}
