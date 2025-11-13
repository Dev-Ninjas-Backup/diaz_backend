import { Global, Module } from '@nestjs/common';
import { PaywallCheckService } from './paywall-check.service';
@Global()
@Module({
  providers: [PaywallCheckService],
  exports: [PaywallCheckService],
})
export class PaywallCheckModule {}
