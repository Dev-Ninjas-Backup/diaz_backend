import { Module } from '@nestjs/common';
import { WhyUsController } from './why-us.controller';
import { WhyUsService } from './why-us.service';

@Module({
  controllers: [WhyUsController],
  providers: [WhyUsService],
  exports: [WhyUsService],
})
export class WhyUsModule {}
