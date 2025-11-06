import { Module } from '@nestjs/common';
import { SubscriptionService } from './services/subscription.service';
import { SubscriptionController } from './subscription.controller';
import { HandleWebhookService } from './services/handle-webhook.service';

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService, HandleWebhookService],
})
export class SubscriptionModule {}
