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
import {
  CreateTermsOfServicesDto,
  UpdateTermsOfServicesDto,
} from './dto/tos.dto';
import { TermsofServicesService } from './terms-of-service.service';
import { SiteType } from 'generated/enums';

@ApiTags('Admin Terms of Service')
@Controller('terms-of-service')
export class TermsOfServiceController {
  constructor(private readonly termsOfServiceService: TermsofServicesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Terms of Service for a specific site' })
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    example: SiteType.FLORIDA,
    description: 'Site type (FLORIDA or JUPITER)',
  })
  @ApiResponse({
    status: 200,
    description: 'Terms of Service retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid site type',
  })
  @ApiResponse({
    status: 404,
    description: 'Terms of Service not found for this site',
  })
  async getTermsOfService(@Query('site') site: SiteType) {
    if (!site || !Object.values(SiteType).includes(site)) {
      throw new BadRequestException(
        `Invalid site. Allowed values: ${Object.values(SiteType).join(', ')}`,
      );
    }

    return this.termsOfServiceService.getTermsOfService(site);
  }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create Terms of Service for a site (only if not exists)',
  })
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    example: SiteType.FLORIDA,
    description: 'Site type (FLORIDA or JUPITER)',
  })
  @ApiBody({ type: CreateTermsOfServicesDto })
  @ApiResponse({
    status: 201,
    description: 'Terms of Service created successfully',
  })
  @ApiResponse({
    status: 400,
    description:
      'Terms of Service already exists for this site. Use PATCH to update.',
  })
  async createTermsOfService(
    @Query('site') site: SiteType,
    @Body() createTermsOfServiceDto: CreateTermsOfServicesDto,
  ) {
    if (!site || !Object.values(SiteType).includes(site)) {
      throw new BadRequestException(
        `Invalid site. Allowed values: ${Object.values(SiteType).join(', ')}`,
      );
    }

    return this.termsOfServiceService.createTermsOfService(
      site,
      createTermsOfServiceDto,
    );
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update Terms of Service for a site' })
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    example: SiteType.FLORIDA,
    description: 'Site type (FLORIDA or JUPITER)',
  })
  @ApiBody({ type: UpdateTermsOfServicesDto })
  @ApiResponse({
    status: 200,
    description: 'Terms of Service updated successfully',
  })
  @ApiResponse({
    status: 404,
    description:
      'Terms of Service not found for this site. Use POST to create.',
  })
  async updateTermsOfService(
    @Query('site') site: SiteType,
    @Body() updateTermsOfServiceDto: UpdateTermsOfServicesDto,
  ) {
    if (!site || !Object.values(SiteType).includes(site)) {
      throw new BadRequestException(
        `Invalid site. Allowed values: ${Object.values(SiteType).join(', ')}`,
      );
    }

    return this.termsOfServiceService.updateTermsOfService(
      site,
      updateTermsOfServiceDto,
    );
  }
}
