import { Module } from '@nestjs/common';
import { HandleWebhookService } from './services/handle-webhook.service';
import { SubscriptionPlanService } from './services/subscription-plan.service';
import { SubscriptionService } from './services/subscription.service';
import { SubscriptionController } from './subscription.controller';

@Module({
  controllers: [SubscriptionController],
  providers: [
    SubscriptionService,
    HandleWebhookService,
    SubscriptionPlanService,
  ],
})
export class SubscriptionModule {}
