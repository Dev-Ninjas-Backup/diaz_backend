import { Module } from '@nestjs/common';
import { PackageBannerController } from './packagebanner.controller';
import { PackageBannerService } from './services/packagebanner.service';

@Module({
  imports: [],
  controllers: [PackageBannerController],
  providers: [PackageBannerService],
  exports: [PackageBannerService],
})
export class PackageBannerModule {}
