import { TPaginatedResponse, TResponse } from '@/common/utils/response.util';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateContactUsDto } from './dto/create-contact-us.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { GetContactsDto } from './dto/get-contacts.dto';
import { ContactService } from './services/contact.service';
import { CreateContactUsService } from './services/create-contact-us.service';
import { CreateContactService } from './services/create-contact.service';

@ApiTags('Shared -- Contact')
@Controller('contact')
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    private readonly createContactService: CreateContactService,
    private readonly createContactUsService: CreateContactUsService,
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

  @ApiOperation({ summary: 'Submit contact us form' })
  @Post('contact-us')
  async createContactUs(
    @Body() dto: CreateContactUsDto,
  ): Promise<TResponse<any>> {
    return await this.createContactUsService.createContactUs(dto);
  }
}
