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
} from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SiteType } from 'generated/client';
import { CreateFaqDto } from './dto/create-faq.dto';
import { FaqResponseDto } from './dto/faq-response.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { FaqService } from './faq.service';

@ApiTags('Shared -- FAQ')
@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get FAQ data for a site' })
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    required: false,
    description: 'Site type',
    example: SiteType.FLORIDA,
  })
  @ApiOkResponse({
    description: 'FAQ data retrieved successfully',
    type: FaqResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'FAQ not found for the specified site',
  })
  async getFaq(@Query('site') site?: SiteType): Promise<TResponse<any>> {
    return await this.faqService.getFaq(site);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create FAQ for a site' })
  @ApiBody({ type: CreateFaqDto })
  @ApiOkResponse({
    description: 'FAQ created successfully',
    type: FaqResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'FAQ already exists for this site',
  })
  async createFaq(@Body() dto: CreateFaqDto): Promise<TResponse<any>> {
    return await this.faqService.create(dto);
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update FAQ for a site' })
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    required: true,
    description: 'Site type',
    example: SiteType.FLORIDA,
  })
  @ApiBody({ type: UpdateFaqDto })
  @ApiOkResponse({
    description: 'FAQ updated successfully',
    type: FaqResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'FAQ not found for the specified site',
  })
  async updateFaq(
    @Query('site') site: SiteType,
    @Body() dto: UpdateFaqDto,
  ): Promise<TResponse<any>> {
    return await this.faqService.update(site, dto);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete FAQ for a site' })
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    required: true,
    description: 'Site type',
    example: SiteType.FLORIDA,
  })
  @ApiOkResponse({
    description: 'FAQ deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'FAQ not found for the specified site',
  })
  async deleteFaq(@Query('site') site: SiteType): Promise<TResponse<any>> {
    return await this.faqService.delete(site);
  }
}
