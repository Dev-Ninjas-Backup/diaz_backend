import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SiteType } from 'generated/enums';
import { AboutUsResponseDto } from './dto/about-us-response.dto';
import { AboutUsService } from './services/about-us.service';

@ApiTags('About Us')
@Controller('about-us')
export class AboutUsController {
  constructor(private readonly aboutUsService: AboutUsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get About Us content for a specific site' })
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    example: SiteType.FLORIDA,
    description: 'Site type (FLORIDA or JUPITER)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'About Us content retrieved successfully',
    type: AboutUsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid site type',
  })
  @ApiResponse({
    status: 404,
    description: 'About Us content not found for this site',
  })
  async getAboutUs(@Query('site') site: SiteType) {
    if (!site || !Object.values(SiteType).includes(site)) {
      throw new BadRequestException(
        `Invalid site. Allowed values: ${Object.values(SiteType).join(', ')}`,
      );
    }

    return this.aboutUsService.getAboutUs(site);
  }
}
