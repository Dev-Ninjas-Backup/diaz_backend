import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { CancelSubscriptionService } from './services/cancel-subscription.service';
import { CreateIntentService } from './services/create-intent.service';
import { InvoicesService } from './services/invoices.service';
import { PaymentRetryService } from './services/payment-retry.service';

@Module({
  controllers: [PaymentController],
  providers: [
    PaymentRetryService,
    InvoicesService,
    CancelSubscriptionService,
    CreateIntentService,
  ],
})
export class PaymentModule {}
