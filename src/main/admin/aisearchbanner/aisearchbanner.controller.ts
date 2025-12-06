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
import { CreateAISearchBannerDto } from './dto/create-aisearchbanner.dto';
import { UpdateAISearchBannerDto } from './dto/update-aisearchbanner.dto';
import { AISearchBannerService } from './services/aisearchbanner.service';

@ApiTags('AI Search Banner')
@Controller('ai-search-banner')
export class AISearchBannerController {
  constructor(private readonly aiSearchBannerService: AISearchBannerService) {}

  /** CREATE */
  @Post()
  @ApiOperation({ summary: 'Create AI search banner' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'AI search banner data with optional image',
    type: CreateAISearchBannerDto,
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'aiSearchBanner', maxCount: 1 }], {
      storage: multer.memoryStorage(),
    }),
  )
  create(
    @UploadedFiles()
    files: { aiSearchBanner?: Express.Multer.File[] },
    @Body() dto: CreateAISearchBannerDto,
  ) {
    const file = files.aiSearchBanner?.[0];
    return this.aiSearchBannerService.create(dto, file);
  }

  /** GET ALL */
  @Get()
  @ApiOperation({ summary: 'Get all AI search banners' })
  findAll() {
    return this.aiSearchBannerService.findAll();
  }

  /** GET ONE */
  @Get(':id')
  @ApiOperation({ summary: 'Get AI search banner by ID' })
  findOne(@Param('id') id: string) {
    return this.aiSearchBannerService.findOne(id);
  }

  /** UPDATE */
  @Patch(':id')
  @ApiOperation({ summary: 'Update AI search banner' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update AI search banner data with optional new image',
    type: UpdateAISearchBannerDto,
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'aiSearchBanner', maxCount: 1 }], {
      storage: multer.memoryStorage(),
    }),
  )
  update(
    @Param('id') id: string,
    @UploadedFiles()
    files: { aiSearchBanner?: Express.Multer.File[] },
    @Body() dto: UpdateAISearchBannerDto,
  ) {
    const file = files.aiSearchBanner?.[0];
    return this.aiSearchBannerService.update(id, dto, file);
  }

  /** DELETE */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete AI search banner' })
  remove(@Param('id') id: string) {
    return this.aiSearchBannerService.remove(id);
  }
}
