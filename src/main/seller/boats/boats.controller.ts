import { FileType, MulterService } from '@/lib/multer/multer.service';
import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BoatImageType } from '@prisma/client';
import { BoatsInfoOnBoardingDto } from './dto/boats-info.dto';
import { SellerInfoOnBoardingDto } from './dto/seller-info.dto';
import {
  SellerOnBoardingDto,
  SellerOnboardingPlanDto,
} from './dto/seller-on-boarding.dto';
import { BoatsService } from './services/boats.service';
import { OnBoardingService } from './services/on-boarding.service';

@ApiTags('Seller -- Boats')
@Controller('boats')
export class BoatsController {
  constructor(
    private readonly onBoardingService: OnBoardingService,
    private readonly boatsService: BoatsService,
  ) {}

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
      new MulterService().createMultipleFileOptions({
        destinationFolder: './temp',
        prefix: 'boat_onboarding',
        fileType: FileType.IMAGE,
        maxFileCount: 75,
      }),
    ),
  )
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
    const mappedFiles = [
      ...(files.covers || []).map((file) => ({
        path: file.path,
        type: BoatImageType.COVER,
        originalName: file.originalname,
      })),
      ...(files.galleries || []).map((file) => ({
        path: file.path,
        type: BoatImageType.GALLERY,
        originalName: file.originalname,
      })),
    ];
    return this.onBoardingService.completeOnBoarding(data, mappedFiles);
  }
}
