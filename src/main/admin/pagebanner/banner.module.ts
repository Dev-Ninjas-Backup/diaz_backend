import { PrismaService } from '@/lib/prisma/prisma.service';
import { Module } from '@nestjs/common';
import { BannerController } from './banner.controller';
import { BannerService } from './services/banner.service';

@Module({
  controllers: [BannerController],
  providers: [BannerService, PrismaService],
})
export class BannerModule {}
