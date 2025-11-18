import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentRetryService } from './services/payment-retry.service';
import { InvoicesService } from './services/invoices.service';

@Module({
  controllers: [PaymentController],
  providers: [PaymentRetryService, InvoicesService],
})
export class PaymentModule {}
