import { TResponse } from '@/common/utils/response.util';
import {
  Body,
  Controller,
  Delete,
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
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SiteType } from 'generated/client';
import * as multer from 'multer';
import { CreateWhyUsDto } from './dto/create-why-us.dto';
import { UpdateWhyUsDto } from './dto/update-why-us.dto';
import { WhyUsResponseDto } from './dto/why-us-response.dto';
import { WhyUsService } from './why-us.service';

@ApiTags('Why Us')
@Controller('why-us')
export class WhyUsController {
  constructor(private readonly whyUsService: WhyUsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Why Us section for a site',
    description:
      'Retrieve the Why Us section with title, description, statistics, button, and 3 images',
  })
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    required: false,
    description: 'Site type',
    example: SiteType.FLORIDA,
  })
  @ApiOkResponse({
    description: 'Why Us section retrieved successfully',
    type: WhyUsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Why Us section not found for the specified site',
  })
  async getWhyUs(@Query('site') site?: SiteType): Promise<TResponse<any>> {
    return await this.whyUsService.getWhyUs(site);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create Why Us section for a site',
    description:
      'Create a new Why Us section with title, description, statistics (excellence, boats sold, listings viewed), button, and up to 3 images',
  })
  @ApiConsumes('multipart/form-data')
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
  @ApiBody({ type: CreateWhyUsDto })
  @ApiOkResponse({
    description: 'Why Us section created successfully',
    type: WhyUsResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Why Us section already exists for this site',
  })
  async createWhyUs(
    @UploadedFiles()
    files: {
      image1?: Express.Multer.File[];
      image2?: Express.Multer.File[];
      image3?: Express.Multer.File[];
    },
    @Body() dto: CreateWhyUsDto,
  ): Promise<TResponse<any>> {
    return await this.whyUsService.create(dto, files);
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update Why Us section for a site',
    description: 'Update Why Us section fields (partial update supported)',
  })
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    required: true,
    description: 'Site type',
    example: SiteType.FLORIDA,
  })
  @ApiConsumes('multipart/form-data')
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
  @ApiBody({ type: UpdateWhyUsDto })
  @ApiOkResponse({
    description: 'Why Us section updated successfully',
    type: WhyUsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Why Us section not found for the specified site',
  })
  async updateWhyUs(
    @Query('site') site: SiteType,
    @UploadedFiles()
    files: {
      image1?: Express.Multer.File[];
      image2?: Express.Multer.File[];
      image3?: Express.Multer.File[];
    },
    @Body() dto: UpdateWhyUsDto,
  ): Promise<TResponse<any>> {
    return await this.whyUsService.update(site, dto, files);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete Why Us section for a site',
  })
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    required: true,
    description: 'Site type',
    example: SiteType.FLORIDA,
  })
  @ApiOkResponse({
    description: 'Why Us section deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Why Us section not found for the specified site',
  })
  async deleteWhyUs(@Query('site') site: SiteType): Promise<TResponse<any>> {
    return await this.whyUsService.delete(site);
  }
}
