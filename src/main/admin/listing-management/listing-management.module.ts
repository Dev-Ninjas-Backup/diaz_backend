import { PrismaService } from '@/lib/prisma/prisma.service';
import { Module } from '@nestjs/common';
import { ListingManagementController } from './listing-management.controller';
import { ListingManagementService } from './services/listing-management.service';

@Module({
  controllers: [ListingManagementController],
  providers: [ListingManagementService, PrismaService],
})
export class ListingManagementModule {}
