import { PrismaService } from '@/lib/prisma/prisma.service';
import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './services/dashboard.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, PrismaService],
})
export class DashboardModule {}
