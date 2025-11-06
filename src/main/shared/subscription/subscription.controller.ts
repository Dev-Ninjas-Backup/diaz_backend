import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SubscriptionService } from './services/subscription.service';

@ApiTags('Shared -- Subscription')
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscription: SubscriptionService) {}

  @ApiOperation({ summary: 'Get all boat subscription plans' })
  @Get('plans')
  async getAllPlans() {
    return this.subscription.getAllPlans();
  }
}
