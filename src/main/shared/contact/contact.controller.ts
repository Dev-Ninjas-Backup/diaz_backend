import { PaginationDto } from '@/common/dto/pagination.dto';
import { TPaginatedResponse, TResponse } from '@/common/utils/response.util';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { SiteType } from 'generated/client';
import { CreateContactUsResponseDataDto } from './dto/contact-us-response.dto';
import { CreateContactUsDto } from './dto/create-contact-us.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { GetContactsDto } from './dto/get-contacts.dto';
import { UpdateContactStatusDto } from './dto/update-contact-status.dto';
import { ContactInfoService } from './services/contact-info.service';
import { ContactService } from './services/contact.service';
import { CreateContactUsService } from './services/create-contact-us.service';
import { CreateContactService } from './services/create-contact.service';
import { GetContactUsService } from './services/get-contact-us.service';
import { UpdateContactStatusService } from './services/update-contact-status.service';

@ApiTags('Shared -- Contact')
@ApiExtraModels(CreateContactUsResponseDataDto)
@Controller('contact')
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    private readonly createContactService: CreateContactService,
    private readonly createContactUsService: CreateContactUsService,
    private readonly getContactUsService: GetContactUsService,
    private readonly contactInfoService: ContactInfoService,
    private readonly updateContactStatusService: UpdateContactStatusService,
  ) {}

  @ApiOperation({ summary: 'Get all contacts' })
  @Get()
  async getContacts(
    @Query() query: GetContactsDto,
  ): Promise<TPaginatedResponse<any>> {
    return await this.contactService.getContacts(query);
  }

  @ApiOperation({ summary: 'Create contact (with boat listing)' })
  @Post()
  async createContact(@Body() dto: CreateContactDto): Promise<TResponse<any>> {
    return await this.createContactService.createContact(dto);
  }

  @ApiOperation({ summary: 'Update contact status' })
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Contact status updated successfully',
  })
  async updateContactStatus(
    @Param('id') id: string,
    @Body() dto: UpdateContactStatusDto,
  ): Promise<TResponse<any>> {
    return await this.updateContactStatusService.updateContactStatus(id, dto);
  }

  @Get('contact-us')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all contact us form submissions' })
  @ApiOkResponse({
    description: 'Contact us submissions retrieved successfully',
  })
  async getContactUs(
    @Query() query: PaginationDto,
  ): Promise<TPaginatedResponse<any>> {
    return await this.getContactUsService.getContactUs(query);
  }

  @Post('contact-us')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit contact us form' })
  @ApiBody({ type: CreateContactUsDto })
  @ApiOkResponse({
    description: 'Contact us form submitted successfully',
    schema: {
      allOf: [
        {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Contact form submitted successfully',
            },
            data: {
              $ref: getSchemaPath(CreateContactUsResponseDataDto),
            },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async createContactUs(
    @Body() dto: CreateContactUsDto,
  ): Promise<TResponse<any>> {
    return await this.createContactUsService.createContactUs(dto);
  }

  @Get('contact-info')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get contact information by site' })
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    required: true,
    description: 'Site identifier (FLORIDA or JUPITER)',
  })
  @ApiOkResponse({
    description: 'Contact information retrieved successfully',
  })
  async getContactInfo(@Query('site') site: SiteType): Promise<TResponse<any>> {
    return await this.contactInfoService.getContactInfo(site);
  }

  @Post('contact-info')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('backgroundImage'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create contact information' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['address', 'email', 'phone', 'workingHours', 'site'],
      properties: {
        address: {
          type: 'string',
          example: '11172 184th Court N Jupiter, FL 33478',
        },
        email: { type: 'string', example: 'monica@floridayachttrader.com' },
        phone: { type: 'string', example: '954-673-7702' },
        workingHours: {
          type: 'string',
          description: 'JSON string array of working hours',
          example: JSON.stringify([
            { day: 'Monday', hours: '9am to 5pm' },
            { day: 'Tuesday', hours: '8am to 5pm' },
          ]),
        },
        socialMedia: {
          type: 'string',
          description: 'JSON string object with social media URLs',
          example: JSON.stringify({
            facebook: 'https://facebook.com',
            linkedin: 'https://linkedin.com',
            twitter: 'https://twitter.com',
            youtube: 'https://youtube.com',
          }),
        },
        site: {
          type: 'string',
          enum: ['FLORIDA', 'JUPITER'],
          example: 'FLORIDA',
        },
        backgroundImage: {
          type: 'string',
          format: 'binary',
          description: 'Background image file',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Contact information created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Contact information already exists for this site',
  })
  async createContactInfo(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<TResponse<any>> {
    return await this.contactInfoService.createContactInfo(body, file);
  }

  @Patch('contact-info')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('backgroundImage'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update contact information' })
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    required: true,
    description: 'Site identifier (FLORIDA or JUPITER)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          example: '11172 184th Court N Jupiter, FL 33478',
        },
        email: { type: 'string', example: 'monica@floridayachttrader.com' },
        phone: { type: 'string', example: '954-673-7702' },
        workingHours: {
          type: 'string',
          description: 'JSON string array of working hours',
          example: JSON.stringify([
            { day: 'Monday', hours: '9am to 5pm' },
            { day: 'Tuesday', hours: '8am to 5pm' },
          ]),
        },
        socialMedia: {
          type: 'string',
          description: 'JSON string object with social media URLs',
          example: JSON.stringify({
            facebook: 'https://facebook.com',
            linkedin: 'https://linkedin.com',
            twitter: 'https://twitter.com',
            youtube: 'https://youtube.com',
          }),
        },
        backgroundImage: {
          type: 'string',
          format: 'binary',
          description: 'Background image file',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Contact information updated successfully',
  })
  async updateContactInfo(
    @Query('site') site: SiteType,
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<TResponse<any>> {
    return await this.contactInfoService.updateContactInfo(site, body, file);
  }
}
