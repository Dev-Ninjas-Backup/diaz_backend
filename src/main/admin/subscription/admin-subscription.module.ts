import { Module } from '@nestjs/common';
import { AdminSubscriptionController } from './admin-subscription.controller';
import { AdminPromoCodeService } from './services/admin-promo-code.service';
import { AdminSubscriptionService } from './services/admin-subscription.service';

@Module({
  controllers: [AdminSubscriptionController],
  providers: [AdminSubscriptionService, AdminPromoCodeService],
  exports: [AdminSubscriptionService, AdminPromoCodeService],
})
export class AdminSubscriptionModule {}
