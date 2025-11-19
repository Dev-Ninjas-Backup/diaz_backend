import { TResponse } from '@/common/utils/response.util';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateContactDto } from './dto/create-contact.dto';
import { ContactService } from './services/contact.service';
import { CreateContactService } from './services/create-contact.service';

@ApiTags('Shared -- Contact')
@Controller('contact')
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    private readonly createContactService: CreateContactService,
  ) {}

  @ApiOperation({ summary: 'Create contact' })
  @Post()
  async createContact(@Body() dto: CreateContactDto): Promise<TResponse<any>> {
    return await this.createContactService.createContact(dto);
  }
}
