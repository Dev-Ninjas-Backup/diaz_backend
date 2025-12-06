import { Module } from '@nestjs/common';
import { AISearchBannerController } from './aisearchbanner.controller';
import { AISearchBannerService } from './services/aisearchbanner.service';

@Module({
  imports: [],
  controllers: [AISearchBannerController],
  providers: [AISearchBannerService],
  exports: [AISearchBannerService],
})
export class AISearchBannerModule {}
