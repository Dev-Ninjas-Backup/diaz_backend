import { ValidateSuperAdmin } from '@/common/jwt/jwt.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
} from './dto/subscription-plan.dto';
import { ValidatePromoCodeDto } from './dto/validate-promo.dto';
import { HandleWebhookService } from './services/handle-webhook.service';
import { SubscriptionPlanService } from './services/subscription-plan.service';
import { SubscriptionService } from './services/subscription.service';

@ApiTags('Shared -- Subscription')
@Controller('subscription')
export class SubscriptionController {
  constructor(
    private readonly subscription: SubscriptionService,
    private readonly handleWebhookService: HandleWebhookService,
    private readonly subscriptionPlanService: SubscriptionPlanService,
  ) {}

  @ApiOperation({ summary: 'Get all boat subscription plans' })
  @Get('plans')
  async getAllPlans() {
    return this.subscription.getAllPlans();
  }

  @ApiOperation({ summary: 'Validate promo code (Public Endpoint)' })
  @Post('promo/validate')
  async validatePromo(@Body() dto: ValidatePromoCodeDto) {
    return this.subscription.validatePromoCode(dto);
  }

  @ApiOperation({ summary: 'Get subscription plan by ID' })
  @Get('plans/:id')
  async getPlanById(@Param('id') id: string) {
    return this.subscriptionPlanService.getPlanById(id);
  }

  @ApiOperation({ summary: 'Create a new subscription plan' })
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Post('plans')
  async createPlan(@Body() dto: CreateSubscriptionPlanDto) {
    return this.subscriptionPlanService.createPlan(dto);
  }

  @ApiOperation({ summary: 'Update a subscription plan' })
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Patch('plans/:id')
  async updatePlan(
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionPlanDto,
  ) {
    return this.subscriptionPlanService.updatePlan(id, dto);
  }

  @ApiOperation({ summary: 'Delete a subscription plan' })
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Delete('plans/:id')
  async deletePlan(@Param('id') id: string) {
    return this.subscriptionPlanService.deletePlan(id);
  }

  @ApiOperation({
    summary: 'Sync subscription plans with Stripe (Admin only)',
    description:
      'Looks up each plan by Stripe lookup key and updates the DB stripePriceId/stripeProductId. Creates new Stripe products/prices for any plan not found.',
  })
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Post('plans/sync-stripe')
  async syncPlansWithStripe() {
    return this.subscriptionPlanService.syncPlansWithStripe();
  }

  @ApiOperation({ summary: 'Handle Stripe webhook events (Public Endpoint)' })
  @Post('webhook/stripe')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Body() body: Buffer, // raw body for Stripe verification
  ) {
    await this.handleWebhookService.handleWebhook(signature, body);
    return { received: true };
  }
}
