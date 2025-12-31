import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import multer from 'multer';
import { CreateAboutUsDto } from './dto/create-aboutus.dto';
import { UpdateAboutUsDto } from './dto/update-aboutus.dto';
import { CreateMissionVisionDto } from './dto/create-mission-vision.dto';
import { CreateOurStoryDto } from './dto/create-our-story.dto';
import { CreateWhatSetsUsApartDto } from './dto/create-what-sets-us-apart.dto';
import { UpdateMissionVisionDto } from './dto/update-mission-vision.dto';
import { UpdateOurStoryDto } from './dto/update-our-story.dto';
import { UpdateWhatSetsUsApartDto } from './dto/update-what-sets-us-apart.dto';
import { AboutUsService } from './services/aboutus.service';
import { MissionVisionService } from './services/mission-vision.service';
import { OurStoryService } from './services/our-story.service';
import { WhatSetsUsApartService } from './services/what-sets-us-apart.service';
import { SiteType } from 'generated/enums';

@ApiTags('Admin About Us')
@Controller('aboutus')
export class AboutUsController {
  constructor(
    private readonly aboutUsService: AboutUsService,
    private readonly ourStoryService: OurStoryService,
    private readonly missionVisionService: MissionVisionService,
    private readonly whatSetsUsApartService: WhatSetsUsApartService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get About Us content for a specific site' })
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    example: SiteType.FLORIDA,
    description: 'Site type (FLORIDA or JUPITER)',
  })
  @ApiResponse({
    status: 200,
    description: 'About Us content retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid site type',
  })
  @ApiResponse({
    status: 404,
    description: 'About Us content not found for this site',
  })
  async getAboutUs(@Query('site') site: SiteType) {
    if (!site || !Object.values(SiteType).includes(site)) {
      throw new BadRequestException(
        `Invalid site. Allowed values: ${Object.values(SiteType).join(', ')}`,
      );
    }

    return this.aboutUsService.getAboutUs(site);
  }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create About Us content for a site (only if not exists)',
  })
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    example: SiteType.FLORIDA,
    description: 'Site type (FLORIDA or JUPITER)',
  })
  @ApiBody({ type: CreateAboutUsDto })
  @ApiResponse({
    status: 201,
    description: 'About Us content created successfully',
  })
  @ApiResponse({
    status: 400,
    description:
      'About Us content already exists for this site. Use PATCH to update.',
  })
  async createAboutUs(
    @Query('site') site: SiteType,
    @Body() createAboutUsDto: CreateAboutUsDto,
  ) {
    if (!site || !Object.values(SiteType).includes(site)) {
      throw new BadRequestException(
        `Invalid site. Allowed values: ${Object.values(SiteType).join(', ')}`,
      );
    }

    return this.aboutUsService.createAboutUs(site, createAboutUsDto);
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update About Us content for a site' })
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    example: SiteType.FLORIDA,
    description: 'Site type (FLORIDA or JUPITER)',
  })
  @ApiBody({ type: UpdateAboutUsDto })
  @ApiResponse({
    status: 200,
    description: 'About Us content updated successfully',
  })
  @ApiResponse({
    status: 404,
    description:
      'About Us content not found for this site. Use POST to create.',
  })
  async updateAboutUs(
    @Query('site') site: SiteType,
    @Body() updateAboutUsDto: UpdateAboutUsDto,
  ) {
    if (!site || !Object.values(SiteType).includes(site)) {
      throw new BadRequestException(
        `Invalid site. Allowed values: ${Object.values(SiteType).join(', ')}`,
      );
    }

    return this.aboutUsService.updateAboutUs(site, updateAboutUsDto);
  }

  @Get('our-story')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Our Story content for a specific site' })
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    example: SiteType.FLORIDA,
    description: 'Site type (FLORIDA or JUPITER)',
  })
  @ApiResponse({
    status: 200,
    description: 'Our Story content retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid site type',
  })
  @ApiResponse({
    status: 404,
    description: 'Our Story content not found for this site',
  })
  async getOurStory(@Query('site') site: SiteType) {
    if (!site || !Object.values(SiteType).includes(site)) {
      throw new BadRequestException(
        `Invalid site. Allowed values: ${Object.values(SiteType).join(', ')}`,
      );
    }

    return this.ourStoryService.getOurStory(site);
  }

  @Post('our-story')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create Our Story content for a site (only if not exists)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    example: SiteType.FLORIDA,
    description: 'Site type (FLORIDA or JUPITER)',
  })
  @ApiBody({ type: CreateOurStoryDto })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image1', maxCount: 1 },
        { name: 'image2', maxCount: 1 },
        { name: 'image3', maxCount: 1 },
        { name: 'image4', maxCount: 1 },
        { name: 'image5', maxCount: 1 },
      ],
      {
        storage: multer.memoryStorage(),
      },
    ),
  )
  @ApiResponse({
    status: 201,
    description: 'Our Story content created successfully',
  })
  @ApiResponse({
    status: 400,
    description:
      'Our Story content already exists for this site. Use PATCH to update.',
  })
  async createOurStory(
    @Query('site') site: SiteType,
    @Body() createOurStoryDto: CreateOurStoryDto,
    @UploadedFiles()
    files: {
      image1?: Express.Multer.File[];
      image2?: Express.Multer.File[];
      image3?: Express.Multer.File[];
      image4?: Express.Multer.File[];
      image5?: Express.Multer.File[];
    },
  ) {
    if (!site || !Object.values(SiteType).includes(site)) {
      throw new BadRequestException(
        `Invalid site. Allowed values: ${Object.values(SiteType).join(', ')}`,
      );
    }

    return this.ourStoryService.createOurStory(site, createOurStoryDto, files);
  }

  @Patch('our-story')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update Our Story content for a site' })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    example: SiteType.FLORIDA,
    description: 'Site type (FLORIDA or JUPITER)',
  })
  @ApiBody({ type: UpdateOurStoryDto })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image1', maxCount: 1 },
        { name: 'image2', maxCount: 1 },
        { name: 'image3', maxCount: 1 },
        { name: 'image4', maxCount: 1 },
        { name: 'image5', maxCount: 1 },
      ],
      {
        storage: multer.memoryStorage(),
      },
    ),
  )
  @ApiResponse({
    status: 200,
    description: 'Our Story content updated successfully',
  })
  @ApiResponse({
    status: 404,
    description:
      'Our Story content not found for this site. Use POST to create.',
  })
  async updateOurStory(
    @Query('site') site: SiteType,
    @Body() updateOurStoryDto: UpdateOurStoryDto,
    @UploadedFiles()
    files: {
      image1?: Express.Multer.File[];
      image2?: Express.Multer.File[];
      image3?: Express.Multer.File[];
      image4?: Express.Multer.File[];
      image5?: Express.Multer.File[];
    },
  ) {
    if (!site || !Object.values(SiteType).includes(site)) {
      throw new BadRequestException(
        `Invalid site. Allowed values: ${Object.values(SiteType).join(', ')}`,
      );
    }

    return this.ourStoryService.updateOurStory(site, updateOurStoryDto, files);
  }

  @Get('mission-vision')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Mission & Vision content for a specific site' })
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    example: SiteType.FLORIDA,
    description: 'Site type (FLORIDA or JUPITER)',
  })
  @ApiResponse({
    status: 200,
    description: 'Mission & Vision content retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid site type',
  })
  @ApiResponse({
    status: 404,
    description: 'Mission & Vision content not found for this site',
  })
  async getMissionVision(@Query('site') site: SiteType) {
    if (!site || !Object.values(SiteType).includes(site)) {
      throw new BadRequestException(
        `Invalid site. Allowed values: ${Object.values(SiteType).join(', ')}`,
      );
    }

    return this.missionVisionService.getMissionVision(site);
  }

  @Post('mission-vision')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create Mission & Vision content for a site (only if not exists)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    example: SiteType.FLORIDA,
    description: 'Site type (FLORIDA or JUPITER)',
  })
  @ApiBody({ type: CreateMissionVisionDto })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image1', maxCount: 1 },
        { name: 'image2', maxCount: 1 },
        { name: 'image3', maxCount: 1 },
      ],
      {
        storage: multer.memoryStorage(),
      },
    ),
  )
  @ApiResponse({
    status: 201,
    description: 'Mission & Vision content created successfully',
  })
  @ApiResponse({
    status: 400,
    description:
      'Mission & Vision content already exists for this site. Use PATCH to update.',
  })
  async createMissionVision(
    @Query('site') site: SiteType,
    @Body() createMissionVisionDto: CreateMissionVisionDto,
    @UploadedFiles()
    files: {
      image1?: Express.Multer.File[];
      image2?: Express.Multer.File[];
      image3?: Express.Multer.File[];
    },
  ) {
    if (!site || !Object.values(SiteType).includes(site)) {
      throw new BadRequestException(
        `Invalid site. Allowed values: ${Object.values(SiteType).join(', ')}`,
      );
    }

    return this.missionVisionService.createMissionVision(
      site,
      createMissionVisionDto,
      files,
    );
  }

  @Patch('mission-vision')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update Mission & Vision content for a site' })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    example: SiteType.FLORIDA,
    description: 'Site type (FLORIDA or JUPITER)',
  })
  @ApiBody({ type: UpdateMissionVisionDto })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image1', maxCount: 1 },
        { name: 'image2', maxCount: 1 },
        { name: 'image3', maxCount: 1 },
      ],
      {
        storage: multer.memoryStorage(),
      },
    ),
  )
  @ApiResponse({
    status: 200,
    description: 'Mission & Vision content updated successfully',
  })
  @ApiResponse({
    status: 404,
    description:
      'Mission & Vision content not found for this site. Use POST to create.',
  })
  async updateMissionVision(
    @Query('site') site: SiteType,
    @Body() updateMissionVisionDto: UpdateMissionVisionDto,
    @UploadedFiles()
    files: {
      image1?: Express.Multer.File[];
      image2?: Express.Multer.File[];
      image3?: Express.Multer.File[];
    },
  ) {
    if (!site || !Object.values(SiteType).includes(site)) {
      throw new BadRequestException(
        `Invalid site. Allowed values: ${Object.values(SiteType).join(', ')}`,
      );
    }

    return this.missionVisionService.updateMissionVision(
      site,
      updateMissionVisionDto,
      files,
    );
  }

  @Get('what-sets-us-apart')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get What Sets Us Apart content for a specific site',
  })
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    example: SiteType.FLORIDA,
    description: 'Site type (FLORIDA or JUPITER)',
  })
  @ApiResponse({
    status: 200,
    description: 'What Sets Us Apart content retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid site type',
  })
  @ApiResponse({
    status: 404,
    description: 'What Sets Us Apart content not found for this site',
  })
  async getWhatSetsUsApart(@Query('site') site: SiteType) {
    if (!site || !Object.values(SiteType).includes(site)) {
      throw new BadRequestException(
        `Invalid site. Allowed values: ${Object.values(SiteType).join(', ')}`,
      );
    }

    return this.whatSetsUsApartService.getWhatSetsUsApart(site);
  }

  @Post('what-sets-us-apart')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Create What Sets Us Apart content for a site (only if not exists)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    example: SiteType.FLORIDA,
    description: 'Site type (FLORIDA or JUPITER)',
  })
  @ApiBody({ type: CreateWhatSetsUsApartDto })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image1', maxCount: 1 },
        { name: 'image2', maxCount: 1 },
      ],
      {
        storage: multer.memoryStorage(),
      },
    ),
  )
  @ApiResponse({
    status: 201,
    description: 'What Sets Us Apart content created successfully',
  })
  @ApiResponse({
    status: 400,
    description:
      'What Sets Us Apart content already exists for this site. Use PATCH to update.',
  })
  async createWhatSetsUsApart(
    @Query('site') site: SiteType,
    @Body() createWhatSetsUsApartDto: CreateWhatSetsUsApartDto,
    @UploadedFiles()
    files: {
      image1?: Express.Multer.File[];
      image2?: Express.Multer.File[];
    },
  ) {
    if (!site || !Object.values(SiteType).includes(site)) {
      throw new BadRequestException(
        `Invalid site. Allowed values: ${Object.values(SiteType).join(', ')}`,
      );
    }

    return this.whatSetsUsApartService.createWhatSetsUsApart(
      site,
      createWhatSetsUsApartDto,
      files,
    );
  }

  @Patch('what-sets-us-apart')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update What Sets Us Apart content for a site',
  })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    example: SiteType.FLORIDA,
    description: 'Site type (FLORIDA or JUPITER)',
  })
  @ApiBody({ type: UpdateWhatSetsUsApartDto })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image1', maxCount: 1 },
        { name: 'image2', maxCount: 1 },
      ],
      {
        storage: multer.memoryStorage(),
      },
    ),
  )
  @ApiResponse({
    status: 200,
    description: 'What Sets Us Apart content updated successfully',
  })
  @ApiResponse({
    status: 404,
    description:
      'What Sets Us Apart content not found for this site. Use POST to create.',
  })
  async updateWhatSetsUsApart(
    @Query('site') site: SiteType,
    @Body() updateWhatSetsUsApartDto: UpdateWhatSetsUsApartDto,
    @UploadedFiles()
    files: {
      image1?: Express.Multer.File[];
      image2?: Express.Multer.File[];
    },
  ) {
    if (!site || !Object.values(SiteType).includes(site)) {
      throw new BadRequestException(
        `Invalid site. Allowed values: ${Object.values(SiteType).join(', ')}`,
      );
    }

    return this.whatSetsUsApartService.updateWhatSetsUsApart(
      site,
      updateWhatSetsUsApartDto,
      files,
    );
  }
}
