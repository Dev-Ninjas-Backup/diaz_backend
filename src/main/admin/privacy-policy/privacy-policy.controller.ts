// src/privacy-policy/privacy-policy.controller.ts
import {
  Controller,
  Get,
  Patch,
  Query,
  Body,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { PrivacyPolicyService } from './privacy-policy.service';
import { Site } from './enum/site.enum';
import { UpdatePrivacyPolicyDto } from './dto/privacy-policy.dto';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('privacy-policy')
@Controller('privacy-policy')
export class PrivacyPolicyController {
  constructor(private readonly privacyPolicyService: PrivacyPolicyService) {}

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update privacy policy for a site (admin only)' })
  @ApiQuery({
    name: 'site',
    enum: Site,
    example: Site.FLORIDA,
  })
  @ApiBody({ type: UpdatePrivacyPolicyDto })
  @ApiResponse({
    status: 200,
    description: 'Privacy policy updated successfully',
  })
  async createUser(
    @Query('site') site: Site,
    @Body() createPrivacyPolicyDto: UpdatePrivacyPolicyDto,
  ) {
    return this.privacyPolicyService.createPrivacyPolicy(
      createPrivacyPolicyDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get privacy policy for a specific site' })
  @ApiQuery({
    name: 'site',
    enum: Site,
    example: Site.JUPITER,
  })
  @ApiResponse({ status: 200, description: 'Returns title and description' })
  async getPrivacyPolicy(@Query('site') site: Site) {
    if (!site || !Object.values(Site).includes(site as Site)) {
      throw new BadRequestException(
        `Invalid site. Allowed values: ${Object.values(Site).join(', ')}`,
      );
    }

    const policy = await this.privacyPolicyService.getPolicy();

    return {
      site,
      privacyTitle: policy || {
        privacyTitle: 'No policy set yet',
        privacyDescription: '',
      },
    };
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update privacy policy for a site (admin only)' })
  @ApiQuery({
    name: 'site',
    enum: Site,
    example: Site.FLORIDA,
  })
  @ApiBody({ type: UpdatePrivacyPolicyDto })
  @ApiResponse({
    status: 200,
    description: 'Privacy policy updated successfully',
  })
  async updatePrivacyPolicy(
    @Query('site') site: Site,
    @Body() dto: UpdatePrivacyPolicyDto,
  ) {
    if (!site || !Object.values(Site).includes(site as Site)) {
      throw new BadRequestException(
        `Invalid site. Allowed values: ${Object.values(Site).join(', ')}`,
      );
    }
    return this.privacyPolicyService.updatePolicy(dto);
  }
}
