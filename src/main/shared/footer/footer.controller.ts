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
import { CreateFooterDto } from './dto/create-footer.dto';
import { FooterResponseDto } from './dto/footer-response.dto';
import { UpdateFooterDto } from './dto/update-footer.dto';
import { FooterService } from './footer.service';

@ApiTags('Shared -- Footer')
@Controller('footer')
export class FooterController {
  constructor(private readonly footerService: FooterService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get footer settings for a site' })
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    required: false,
    description: 'Site type',
    example: SiteType.FLORIDA,
  })
  @ApiOkResponse({
    description: 'Footer retrieved successfully',
    type: FooterResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Footer not found for the specified site',
  })
  async getFooter(@Query('site') site?: SiteType): Promise<TResponse<any>> {
    return await this.footerService.getFooter(site);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create footer settings for a site' })
  @ApiBody({ type: CreateFooterDto })
  @ApiOkResponse({
    description: 'Footer created successfully',
    type: FooterResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Footer already exists for this site',
  })
  async createFooter(@Body() dto: CreateFooterDto): Promise<TResponse<any>> {
    return await this.footerService.create(dto);
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update footer settings for a site' })
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    required: true,
    description: 'Site type',
    example: SiteType.FLORIDA,
  })
  @ApiBody({ type: UpdateFooterDto })
  @ApiOkResponse({
    description: 'Footer updated successfully',
    type: FooterResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Footer not found for the specified site',
  })
  async updateFooter(
    @Query('site') site: SiteType,
    @Body() dto: UpdateFooterDto,
  ): Promise<TResponse<any>> {
    return await this.footerService.update(site, dto);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete footer settings for a site' })
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    required: true,
    description: 'Site type',
    example: SiteType.FLORIDA,
  })
  @ApiOkResponse({
    description: 'Footer deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Footer not found for the specified site',
  })
  async deleteFooter(@Query('site') site: SiteType): Promise<TResponse<any>> {
    return await this.footerService.delete(site);
  }
}
