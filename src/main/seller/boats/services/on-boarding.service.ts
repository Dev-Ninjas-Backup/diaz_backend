import { HandleError } from '@/common/error/handle-error.decorator';
import { ParseJsonPipe } from '@/common/pipe/parse-json.pipe';
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
    const parsePipe = new ParseJsonPipe();

    const boatInfo = parsePipe.transform(data.boatInfo);
    const sellerInfo = parsePipe.transform(data.sellerInfo);

    // TODO: Implement onboarding logic here
    return successResponse(
      {
        boatInfo,
        sellerInfo,
        covers: files.covers?.map((file) => file.originalname) || [],
        galleries: files.galleries?.map((file) => file.originalname) || [],
      },
      'Onboarding completed successfully',
    );
  }
}
