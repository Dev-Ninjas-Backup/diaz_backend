import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import multer from 'multer';
import { CreatePackageBannerDto } from './dto/create-packagebanner.dto';
import { UpdatePackageBannerDto } from './dto/update-packagebanner.dto';
import { PackageBannerService } from './services/packagebanner.service';

@ApiTags('Admin -- Package Banner')
@Controller('package-banner')
export class PackageBannerController {
  constructor(private readonly packageBannerService: PackageBannerService) {}

  /** CREATE */
  @Post()
  @ApiOperation({ summary: 'Create package banner' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Package banner data with optional image',
    type: CreatePackageBannerDto,
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'packageBanner', maxCount: 1 }], {
      storage: multer.memoryStorage(),
    }),
  )
  create(
    @UploadedFiles()
    files: { packageBanner?: Express.Multer.File[] },
    @Body() dto: CreatePackageBannerDto,
  ) {
    const file = files.packageBanner?.[0];
    return this.packageBannerService.create(dto, file);
  }

  /** GET ALL */
  @Get()
  @ApiOperation({ summary: 'Get all package banners' })
  findAll() {
    return this.packageBannerService.findAll();
  }

  /** GET ONE */
  @Get(':id')
  @ApiOperation({ summary: 'Get package banner by ID' })
  findOne(@Param('id') id: string) {
    return this.packageBannerService.findOne(id);
  }

  /** UPDATE */
  @Patch(':id')
  @ApiOperation({ summary: 'Update package banner' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update package banner data with optional new image',
    type: UpdatePackageBannerDto,
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'packageBanner', maxCount: 1 }], {
      storage: multer.memoryStorage(),
    }),
  )
  update(
    @Param('id') id: string,
    @UploadedFiles()
    files: { packageBanner?: Express.Multer.File[] },
    @Body() dto: UpdatePackageBannerDto,
  ) {
    const file = files.packageBanner?.[0];
    return this.packageBannerService.update(id, dto, file);
  }

  /** DELETE */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete package banner' })
  remove(@Param('id') id: string) {
    return this.packageBannerService.remove(id);
  }
}
