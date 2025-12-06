import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SiteType } from 'generated/enums';
import multer from 'multer';
import { CreateFeaturedBrandDto } from './dto/create-featured-brand.dto';
import { GetFeaturedBrandQueryDto } from './dto/get-featured-brand.dto';
import { UpdateFeaturedBrandDto } from './dto/update-featured-brand.dto';
import { FeaturedBrandsService } from './services/featured-brands.service';

@ApiTags('Admin -- Featured Brands')
@Controller('featured-brands')
export class FeaturedBrandsController {
  constructor(private readonly featuredBrandsService: FeaturedBrandsService) {}

  @Post()
  @ApiOperation({ summary: 'Create featured brand' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'featuredbrandLogo', maxCount: 1 }], {
      storage: multer.memoryStorage(),
    }),
  )
  create(
    @UploadedFiles() files: { featuredbrandLogo?: Express.Multer.File[] },
    @Body() dto: CreateFeaturedBrandDto,
  ) {
    if (!dto || !dto.site) {
      throw new BadRequestException('Missing required field: site');
    }

    return this.featuredBrandsService.create(
      dto,
      files?.featuredbrandLogo?.[0],
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all featured brands by site' })
  findAll(@Query() dto: GetFeaturedBrandQueryDto) {
    return this.featuredBrandsService.findAll(dto.site);
  }

  @Get(':site')
  @ApiOperation({ summary: 'Get featured brands by site' })
  findOne(@Param('site') site: SiteType) {
    return this.featuredBrandsService.findAllBySite(site);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update featured brand' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'featuredbrandLogo', maxCount: 1 }], {
      storage: multer.memoryStorage(),
    }),
  )
  update(
    @Param('id') id: string,
    @UploadedFiles() files: { featuredbrandLogo?: Express.Multer.File[] },
    @Body() dto: UpdateFeaturedBrandDto,
  ) {
    return this.featuredBrandsService.update(
      id,
      dto,
      files?.featuredbrandLogo?.[0],
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete featured brand' })
  remove(@Param('id') id: string) {
    return this.featuredBrandsService.remove(id);
  }
}
