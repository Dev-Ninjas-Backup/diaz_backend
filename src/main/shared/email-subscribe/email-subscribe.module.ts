import { Module } from '@nestjs/common';
import { EmailSubscribeController } from './email-subscribe.controller';
import { EmailSubscribeService } from './email-subscribe.service';

@Module({
  controllers: [EmailSubscribeController],
  providers: [EmailSubscribeService],
  exports: [EmailSubscribeService],
})
export class EmailSubscribeModule {}
