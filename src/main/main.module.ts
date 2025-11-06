import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { SellerModule } from './seller/seller.module';
import { SharedModule } from './shared/shared.module';
@Module({
  imports: [AuthModule, AdminModule, SellerModule, SharedModule],
  controllers: [],
  providers: [],
})
export class MainModule {}
