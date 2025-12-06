import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ContactPageService } from './contact-page.service';
import { UpdateContactPageDto } from './dto/contact-page.dto';
import { Site } from '../privacy-policy/enum/site.enum';
import { ApiOperation } from '@nestjs/swagger';

@Controller('contact-page')
export class ContactPageController {
  constructor(private readonly contactPageService: ContactPageService) {}

  @Post('create')
  async createContactPage(
    @Body() updateContactPageDto: UpdateContactPageDto,
    @Query('site') site: Site,
  ) {
    if (!site || !Object.values(Site).includes(site as Site)) {
      throw new BadRequestException(
        `Invalid site. Allowed values: ${Object.values(Site).join(', ')}`,
      );
    }
    return this.contactPageService.createAboutUs(updateContactPageDto);
  }

  @ApiOperation({
    summary: 'update contact page content for a site (admin only)',
  })
  @Patch('update')
  async UpdateContactPage(
    @Body() updateContactPageDto: UpdateContactPageDto,
    @Query('site') site: Site,
  ) {
    if (!site || !Object.values(Site).includes(site as Site)) {
      throw new BadRequestException(
        `Invalid site. Allowed values: ${Object.values(Site).join(', ')}`,
      );
    }

    return this.contactPageService.updateContactPage(updateContactPageDto);
  }

  @ApiOperation({ summary: 'Get aboutus page content for a site (admin only)' })
  @Get('get-contact-page')
  async getContactPage() {
    return this.contactPageService.getContactPage();
  }
}
