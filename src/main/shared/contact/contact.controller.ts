import { TPaginatedResponse, TResponse } from '@/common/utils/response.util';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { ContactType } from 'generated/client';
import { CreateContactUsResponseDataDto } from './dto/contact-us-response.dto';
import { CreateContactUsDto } from './dto/create-contact-us.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { GetContactsDto } from './dto/get-contacts.dto';
import { ContactService } from './services/contact.service';
import { CreateContactUsService } from './services/create-contact-us.service';
import { CreateContactService } from './services/create-contact.service';

@ApiTags('Shared -- Contact')
@ApiExtraModels(CreateContactUsResponseDataDto)
@Controller('contact')
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    private readonly createContactService: CreateContactService,
    private readonly createContactUsService: CreateContactUsService,
  ) {}

  @Get('contact-us')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all contact us form submissions' })
  @ApiOkResponse({
    description: 'Contact us submissions retrieved successfully',
  })
  async getContactUs(
    @Query() query: CreateContactDto,
  ): Promise<TPaginatedResponse<any>> {
    const filteredQuery: GetContactsDto = {
      ...query,
      type: ContactType.GLOBAL,
    };
    return await this.contactService.getContacts(filteredQuery);
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
}
