import { TResponse } from '@/common/utils/response.util';
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
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SiteType } from 'generated/client';
import { SubscribeEmailDto } from './dto/subscribe-email.dto';
import {
  SubscribeResponseDto,
  UnsubscribeResponseDto,
} from './dto/subscribe-response.dto';
import { UnsubscribeEmailDto } from './dto/unsubscribe-email.dto';
import { EmailSubscribeService } from './email-subscribe.service';

@ApiTags('Shared -- Email Subscribe')
@Controller('email-subscribe')
export class EmailSubscribeController {
  constructor(private readonly emailSubscribeService: EmailSubscribeService) {}

  @Post('subscribe')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Subscribe to newsletter',
    description:
      'Subscribe an email address to the newsletter for a specific site',
  })
  @ApiBody({ type: SubscribeEmailDto })
  @ApiOkResponse({
    description: 'Successfully subscribed to newsletter',
    type: SubscribeResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Email already subscribed to this site',
  })
  async subscribe(@Body() dto: SubscribeEmailDto): Promise<TResponse<any>> {
    return await this.emailSubscribeService.subscribe(dto);
  }

  @Post('unsubscribe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Unsubscribe from newsletter',
    description:
      'Unsubscribe an email address from the newsletter for a specific site',
  })
  @ApiBody({ type: UnsubscribeEmailDto })
  @ApiOkResponse({
    description: 'Successfully unsubscribed from newsletter',
    type: UnsubscribeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already unsubscribed',
  })
  async unsubscribe(@Body() dto: UnsubscribeEmailDto): Promise<TResponse<any>> {
    return await this.emailSubscribeService.unsubscribe(dto);
  }

  @Get('list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all subscriptions',
    description:
      'Get all email subscriptions (both active and inactive) for a site or all sites',
  })
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    required: false,
    description: 'Filter by site type',
    example: SiteType.FLORIDA,
  })
  @ApiOkResponse({
    description: 'Subscriptions retrieved successfully',
  })
  async getSubscriptions(
    @Query('site') site?: SiteType,
  ): Promise<TResponse<any>> {
    return await this.emailSubscribeService.getSubscriptions(site);
  }

  @Get('active')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get active subscriptions',
    description: 'Get only active email subscriptions for a site or all sites',
  })
  @ApiQuery({
    name: 'site',
    enum: SiteType,
    required: false,
    description: 'Filter by site type',
    example: SiteType.FLORIDA,
  })
  @ApiOkResponse({
    description: 'Active subscriptions retrieved successfully',
  })
  async getActiveSubscriptions(
    @Query('site') site?: SiteType,
  ): Promise<TResponse<any>> {
    return await this.emailSubscribeService.getActiveSubscriptions(site);
  }
}
