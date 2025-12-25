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
import { CreateContactPageDto } from './dto/create-contactus.dto';
import { UpdateContactPageDto } from './dto/update-contactus.dto';
import { ContactUsService } from './services/contactus.service';
import { SiteType } from 'generated/enums';

@ApiTags('Admin Contact Us')
@Controller('contactus')
export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Contact Us content for a specific site' })
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    example: SiteType.FLORIDA,
    description: 'Site type (FLORIDA or JUPITER)',
  })
  @ApiResponse({
    status: 200,
    description: 'Contact Us content retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid site type',
  })
  @ApiResponse({
    status: 404,
    description: 'Contact Us content not found for this site',
  })
  async getContactUs(@Query('site') site: SiteType) {
    if (!site || !Object.values(SiteType).includes(site)) {
      throw new BadRequestException(
        `Invalid site. Allowed values: ${Object.values(SiteType).join(', ')}`,
      );
    }

    return this.contactUsService.getContactUs(site);
  }

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create Contact Us content for a site (only if not exists)',
  })
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    example: SiteType.FLORIDA,
    description: 'Site type (FLORIDA or JUPITER)',
  })
  @ApiBody({ type: CreateContactPageDto })
  @ApiResponse({
    status: 201,
    description: 'Contact Us content created successfully',
  })
  @ApiResponse({
    status: 400,
    description:
      'Contact Us content already exists for this site. Use PATCH to update.',
  })
  async createContactUs(
    @Query('site') site: SiteType,
    @Body() createContactPageDto: CreateContactPageDto,
  ) {
    if (!site || !Object.values(SiteType).includes(site)) {
      throw new BadRequestException(
        `Invalid site. Allowed values: ${Object.values(SiteType).join(', ')}`,
      );
    }

    return this.contactUsService.createContactUs(site, createContactPageDto);
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update Contact Us content for a site' })
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    example: SiteType.FLORIDA,
    description: 'Site type (FLORIDA or JUPITER)',
  })
  @ApiBody({ type: UpdateContactPageDto })
  @ApiResponse({
    status: 200,
    description: 'Contact Us content updated successfully',
  })
  @ApiResponse({
    status: 404,
    description:
      'Contact Us content not found for this site. Use POST to create.',
  })
  async updateContactUs(
    @Query('site') site: SiteType,
    @Body() updateContactPageDto: UpdateContactPageDto,
  ) {
    if (!site || !Object.values(SiteType).includes(site)) {
      throw new BadRequestException(
        `Invalid site. Allowed values: ${Object.values(SiteType).join(', ')}`,
      );
    }

    return this.contactUsService.updateContactUs(site, updateContactPageDto);
  }
}
