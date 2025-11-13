import { Module } from '@nestjs/common';
import { BoatsModule } from './boats/boats.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [BoatsModule, PaymentModule],
  controllers: [],
  providers: [],
})
export class SellerModule {}
