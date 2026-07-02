import { Module } from '@nestjs/common';
import { RedirectController } from './redirect.controller';
import { ShareController } from './share.controller';

@Module({
  controllers: [RedirectController, ShareController],
})
export class RedirectModule {}
