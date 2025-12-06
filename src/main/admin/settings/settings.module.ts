import { PrismaService } from '@/lib/prisma/prisma.service';
import { S3Service } from '@/lib/s3/s3.service';
import { Module } from '@nestjs/common';
import { SettingsService } from './services/settings.service';
import { SettingsController } from './settings.controller';

@Module({
  controllers: [SettingsController],
  providers: [SettingsService, PrismaService, S3Service],
})
export class SettingsModule {}
