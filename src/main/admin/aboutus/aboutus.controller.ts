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
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateAboutUsDto } from './dto/create-aboutus.dto';
import { UpdateAboutUsDto } from './dto/update-aboutus.dto';
import { AboutUsService } from './services/aboutus.service';
import { SiteType } from 'generated/enums';

@ApiTags('Admin About Us')
@Controller('aboutus')
export class AboutUsController {
  constructor(private readonly aboutUsService: AboutUsService) {}

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
}
