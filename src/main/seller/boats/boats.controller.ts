import { Public, ValidateAuth } from '@/common/jwt/jwt.decorator';
import { TResponse } from '@/common/utils/response.util';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OnBoardingService } from './services/on-boarding.service';

@ApiBearerAuth()
@ValidateAuth()
@ApiTags('Seller -- Boats')
@Controller('boats')
export class BoatsController {
  constructor(private readonly onBoardingService: OnBoardingService) {}

  @ApiOperation({
    summary:
      'Seller Onboarding with Boat Onboarding, returns payment secret for Stripe (Public)',
  })
  @Public()
  @Post('onboarding')
  async completeOnBoarding(@Body() data: any): Promise<TResponse<any>> {
    return this.onBoardingService.completeOnBoarding(data);
  }
}
