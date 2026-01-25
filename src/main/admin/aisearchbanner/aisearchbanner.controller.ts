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

@ApiTags('Admin -- AI Search Banner (JUPITER Site Only)')
@Controller('ai-search-banner')
export class AISearchBannerController {
  constructor(private readonly aiSearchBannerService: AISearchBannerService) {}

  @Post()
  @ApiOperation({
    summary: 'Create AI search banner for JUPITER site',
    description:
      'Creates the AI search banner for JUPITER site. Only ONE banner is allowed. If a banner already exists, use the UPDATE endpoint instead.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description:
      'AI search banner data with optional image (JUPITER site only)',
    type: CreateAISearchBannerDto,
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'aisearchBanner', maxCount: 1 }], {
      storage: multer.memoryStorage(),
    }),
  )
  create(
    @UploadedFiles()
    files: { aisearchBanner?: Express.Multer.File[] },
    @Body() dto: CreateAISearchBannerDto,
  ) {
    const file = files.aisearchBanner?.[0];
    return this.aiSearchBannerService.create(dto, file);
  }

  @Get()
  @ApiOperation({
    summary: 'Get AI search banner for JUPITER site',
    description:
      'Returns the AI search banner for JUPITER site. Returns a message with an array containing one banner, or an empty array with a message if no banner exists.',
  })
  findAll() {
    return this.aiSearchBannerService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get AI search banner by ID',
    description: 'Get specific AI search banner by its ID',
  })
  findOne(@Param('id') id: string) {
    return this.aiSearchBannerService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update AI search banner for JUPITER site',
    description:
      'Updates the AI search banner. All fields are optional - only provide the fields you want to update.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update AI search banner data with optional new image',
    type: UpdateAISearchBannerDto,
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'aisearchBanner', maxCount: 1 }], {
      storage: multer.memoryStorage(),
    }),
  )
  update(
    @Param('id') id: string,
    @UploadedFiles()
    files: { aisearchBanner?: Express.Multer.File[] },
    @Body() dto: UpdateAISearchBannerDto,
  ) {
    const file = files.aisearchBanner?.[0];
    return this.aiSearchBannerService.update(id, dto, file);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete AI search banner for JUPITER site',
    description:
      'Deletes the AI search banner. You can create a new one after deletion.',
  })
  remove(@Param('id') id: string) {
    return this.aiSearchBannerService.remove(id);
  }
}
