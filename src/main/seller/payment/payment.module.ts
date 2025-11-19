import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { CancelSubscriptionService } from './services/cancel-subscription.service';
import { InvoicesService } from './services/invoices.service';
import { PaymentRetryService } from './services/payment-retry.service';

@Module({
  controllers: [PaymentController],
  providers: [PaymentRetryService, InvoicesService, CancelSubscriptionService],
})
export class PaymentModule {}
