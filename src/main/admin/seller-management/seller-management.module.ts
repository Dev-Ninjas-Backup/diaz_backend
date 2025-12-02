import { Module } from '@nestjs/common';
import { SellerManagementController } from './seller-management.controller';
import { SellerManagementService } from './seller-management.service';

@Module({
  controllers: [SellerManagementController],
  providers: [SellerManagementService],
})
export class SellerManagementModule {}
