import { GetUser, Public, ValidateAuth } from '@/common/jwt/jwt.decorator';
import { FileType, MulterService } from '@/lib/multer/multer.service';
import { QueueFile } from '@/lib/queue/interface/image-process.payload';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
import { BoatImageType } from 'generated/client';
import { CreateBoatsInfoDto } from './dto/boats-info.dto';
import { BoatListingDto } from './dto/boats.dto';
import { GetOwnBoatsDto } from './dto/get-own-boats.dto';
import { SellerInfoOnBoardingDto } from './dto/seller-info.dto';
import {
  SellerOnBoardingDto,
  SellerOnboardingPlanDto,
} from './dto/seller-on-boarding.dto';
import {
  UpdateListingDtoWithFilesDto,
  UpdateListingDtoWithImagesDto,
} from './dto/update-boats.dto';
import { BoatsService } from './services/boats.service';
import { CreateListingService } from './services/create-listing.service';
import { OnBoardingService } from './services/on-boarding.service';
import { UpdateListingService } from './services/update-listing.service';

@ApiTags('Seller -- Onboarding & Boats')
@ApiBearerAuth()
@ValidateAuth()
@Controller('boats/seller')
export class BoatsController {
  constructor(
    private readonly onBoardingService: OnBoardingService,
    private readonly boatsService: BoatsService,
    private readonly createListingService: CreateListingService,
    private readonly updateListingService: UpdateListingService,
  ) {}

  @ApiOperation({
    summary:
      'Seller Onboarding with Boat Onboarding, returns payment secret for Stripe & preview data (Public)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: () => SellerOnBoardingDto })
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
  @Public()
  @Post('onboarding')
  async sellerOnBoarding(
    @Body()
    data: {
      planId: SellerOnboardingPlanDto['planId'];
      boatInfo: CreateBoatsInfoDto;
      sellerInfo: SellerInfoOnBoardingDto;
    },
    @UploadedFiles()
    files: {
      covers?: Express.Multer.File[];
      galleries?: Express.Multer.File[];
    },
  ) {
    const mappedFiles: QueueFile[] = [
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
    return this.onBoardingService.sellerOnBoarding(data, mappedFiles);
  }

  @ApiOperation({ summary: 'Get Boat Subscription Confirmation (Public)' })
  @Public()
  @Get('subscription-confirmation/:userId')
  async getSubscriptionConfirmation(@Param('userId') userId: string) {
    return this.boatsService.getSubscriptionConfirmation(userId);
  }

  @ApiOperation({ summary: 'Get Own Boats' })
  @Get('get-own-boats')
  async getOwnBoats(
    @GetUser('sub') userId: string,
    @Query() query: GetOwnBoatsDto,
  ) {
    return this.boatsService.getOwnBoats(userId, query);
  }

  @ApiOperation({ summary: 'Get Boat Details' })
  @Get('get-own-boats/:boatId')
  async getSingleBoat(
    @GetUser('sub') userId: string,
    @Param('boatId') boatId: string,
  ) {
    return this.boatsService.getSingleBoat(userId, boatId);
  }

  @ApiOperation({ summary: 'Create Boat Listing' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: BoatListingDto })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'covers', maxCount: 5 },
        { name: 'galleries', maxCount: 70 },
      ],
      new MulterService().createMultipleFileOptions({
        destinationFolder: './temp',
        prefix: 'boat_listing',
        fileType: FileType.IMAGE,
        maxFileCount: 75,
      }),
    ),
  )
  @Post('create-listing')
  async createListing(
    @GetUser('sub') userId: string,
    @Body()
    data: {
      boatInfo: CreateBoatsInfoDto;
    },
    @UploadedFiles()
    files: {
      covers?: Express.Multer.File[];
      galleries?: Express.Multer.File[];
    },
  ) {
    const mappedFiles: QueueFile[] = [
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
    return this.createListingService.createListing(userId, data, mappedFiles);
  }

  @ApiOperation({ summary: 'Update Boat Listing' })
  @ApiBody({ type: UpdateListingDtoWithFilesDto })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'covers', maxCount: 5 },
        { name: 'galleries', maxCount: 70 },
      ],
      new MulterService().createMultipleFileOptions({
        destinationFolder: './temp',
        prefix: 'boat_listing_update',
        fileType: FileType.IMAGE,
        maxFileCount: 75,
      }),
    ),
  )
  @Patch('update-listing/:boatId')
  async updateListingDto(
    @GetUser('sub') userId: string,
    @Param('boatId') boatId: string,
    @UploadedFiles()
    files: {
      covers?: Express.Multer.File[];
      galleries?: Express.Multer.File[];
    },
    @Body()
    data: {
      boatInfo?: UpdateListingDtoWithImagesDto;
    },
  ) {
    const mappedFiles: QueueFile[] = [
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
    return this.updateListingService.updateListing(
      userId,
      boatId,
      mappedFiles,
      data?.boatInfo,
    );
  }
}
