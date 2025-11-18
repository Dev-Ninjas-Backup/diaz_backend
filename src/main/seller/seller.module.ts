import { Module } from '@nestjs/common';
import { BoatsModule } from './boats/boats.module';
import { PaymentModule } from './payment/payment.module';
import { LeadsModule } from './leads/leads.module';

@Module({
  imports: [BoatsModule, PaymentModule, LeadsModule],
  controllers: [],
  providers: [],
})
export class SellerModule {}
