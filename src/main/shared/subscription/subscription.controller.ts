import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HandleWebhookService } from './services/handle-webhook.service';
import { SubscriptionService } from './services/subscription.service';

@ApiTags('Shared -- Subscription')
@Controller('subscription')
export class SubscriptionController {
  constructor(
    private readonly subscription: SubscriptionService,
    private readonly handleWebhookService: HandleWebhookService,
  ) {}

  @ApiOperation({ summary: 'Get all boat subscription plans' })
  @Get('plans')
  async getAllPlans() {
    return this.subscription.getAllPlans();
  }

  @ApiOperation({ summary: 'Handle Stripe webhook events (Public Endpoint)' })
  @Post('webhook/stripe')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Body() body: Buffer, // raw body for Stripe verification
  ) {
    try {
      await this.handleWebhookService.handleWebhook(signature, body);
      return { received: true };
    } catch (error) {
      return { received: false, error: error.message };
    }
  }
}
