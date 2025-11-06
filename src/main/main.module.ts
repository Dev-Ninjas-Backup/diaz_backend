import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { SellerModule } from './seller/seller.module';
import { SharedModule } from './shared/shared.module';
@Module({
  imports: [SharedModule, AdminModule, SellerModule],
  controllers: [],
  providers: [],
})
export class MainModule {}
