import { Public } from '@/common/jwt/jwt.decorator';
import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as multer from 'multer';
import { BoatsInfoOnBoardingDto } from './dto/boats-info.dto';
import { SellerInfoOnBoardingDto } from './dto/seller-info.dto';
import {
  SellerOnBoardingDto,
  SellerOnboardingPlanDto,
} from './dto/seller-on-boarding.dto';
import { BoatsService } from './services/boats.service';
import { OnBoardingService } from './services/on-boarding.service';

// @ApiBearerAuth()
// @ValidateAuth()
@ApiTags('Seller -- Boats')
@Controller('boats')
export class BoatsController {
  constructor(
    private readonly onBoardingService: OnBoardingService,
    private readonly boatsService: BoatsService,
  ) {}

  @ApiOperation({ summary: 'Get all boat subscription plans' })
  @Get('plans')
  async getAllPlans() {
    return this.boatsService.getAllPlans();
  }

  @ApiOperation({
    summary:
      'Seller Onboarding with Boat Onboarding, returns payment secret for Stripe & preview data (Public)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: SellerOnBoardingDto })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'covers', maxCount: 5 },
        { name: 'galleries', maxCount: 70 },
      ],
      {
        storage: multer.memoryStorage(),
        limits: { files: 75 },
      },
    ),
  )
  @Public()
  @Post('onboarding')
  async completeOnBoarding(
    @Body()
    data: {
      planId: SellerOnboardingPlanDto['planId'];
      boatInfo: BoatsInfoOnBoardingDto;
      sellerInfo: SellerInfoOnBoardingDto;
    },
    @UploadedFiles()
    files: {
      covers?: Express.Multer.File[];
      galleries?: Express.Multer.File[];
    },
  ) {
    return this.onBoardingService.completeOnBoarding(data, files);
  }
}
