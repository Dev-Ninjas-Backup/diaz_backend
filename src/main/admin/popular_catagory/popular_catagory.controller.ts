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

import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import {
  CreatePopularCategoryDto,
  UpdatePopularCategoryDto,
} from './DTO/update cataergory.dto';
import { PopularCategoryService } from './popular_catagory.service';

@ApiTags('POPULAR_CATEGORY')
@Controller('popular-category')
export class PopularCategoryController {
  constructor(
    private readonly popularCategoryService: PopularCategoryService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('bannerImg'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreatePopularCategoryDto })
  create(
    @Body() dto: CreatePopularCategoryDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.popularCategoryService.create(dto, files);
  }

  @Get()
  findAll() {
    return this.popularCategoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.popularCategoryService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('bannerImg'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdatePopularCategoryDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePopularCategoryDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.popularCategoryService.update(+id, dto, files);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.popularCategoryService.remove(+id);
  }
}
