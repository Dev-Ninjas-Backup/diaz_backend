import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentRetryService } from './services/payment-retry.service';

@Module({
  controllers: [PaymentController],
  providers: [PaymentRetryService],
})
export class PaymentModule {}
