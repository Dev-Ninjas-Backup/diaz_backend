import { Module } from '@nestjs/common';
import { AboutUsController } from './aboutus.controller';
import { AboutUsService } from './services/aboutus.service';

@Module({
  controllers: [AboutUsController],
  providers: [AboutUsService],
})
export class AboutUsModule {}
