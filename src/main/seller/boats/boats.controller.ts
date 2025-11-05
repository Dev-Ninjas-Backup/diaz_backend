import { Public, ValidateAuth } from '@/common/jwt/jwt.decorator';
import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import * as multer from 'multer';
import { SellerOnBoardingDto } from './dto/seller-on-boarding.dto';
import { OnBoardingService } from './services/on-boarding.service';

@ApiBearerAuth()
@ValidateAuth()
@ApiTags('Seller -- Boats')
@Controller('boats')
export class BoatsController {
  constructor(private readonly onBoardingService: OnBoardingService) {}

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
        { name: 'galleries', maxCount: 5 },
      ],
      {
        storage: multer.memoryStorage(),
        limits: { files: 10 },
      },
    ),
  )
  @Public()
  @Post('onboarding')
  async completeOnBoarding(
    @Body() data: SellerOnBoardingDto,
    @UploadedFiles()
    files: {
      covers?: Express.Multer.File[];
      galleries?: Express.Multer.File[];
    },
  ) {
    return this.onBoardingService.completeOnBoarding(data, files);
  }
}
