import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AboutUsService } from './about-us.services';
import { UpdateAboutUsDto } from './dto/about-us.dto';
import { Site } from '../privacy-policy/enum/site.enum';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('about-us')
@Controller('about-us')
export class AboutUsController {
  constructor(private readonly aboutUsService: AboutUsService) {}

  @ApiOperation({
    summary: 'create aboutus page content for a site (admin only)',
  })
  @Post('create')
  async createAboutUs(
    @Body() updateAboutUsDto: UpdateAboutUsDto,
    @Query('site') site: Site,
  ) {
    if (!site || !Object.values(Site).includes(site as Site)) {
      throw new BadRequestException(
        `Invalid site. Allowed values: ${Object.values(Site).join(', ')}`,
      );
    }
    return this.aboutUsService.createAboutUs(updateAboutUsDto);
  }

  @ApiOperation({
    summary: 'update aboutus page content for a site (admin only)',
  })
  @Patch('update')
  async UpdateAboutUsDto(
    @Body() updateAboutUsDto: UpdateAboutUsDto,
    @Query('site') site: Site,
  ) {
    if (!site || !Object.values(Site).includes(site as Site)) {
      throw new BadRequestException(
        `Invalid site. Allowed values: ${Object.values(Site).join(', ')}`,
      );
    }

    return this.aboutUsService.updateAboutUs(updateAboutUsDto);
  }

  @ApiOperation({ summary: 'Get aboutus page content for a site (admin only)' })
  @Get('get-aobutus')
  async getAboutUs() {
    return this.aboutUsService.getAboutUs();
  }
}
