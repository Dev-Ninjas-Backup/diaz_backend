import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { BoatsModule } from './boats/boats.module';
@Module({
  imports: [SubscriptionModule, AuthModule, BoatsModule],
  controllers: [],
  providers: [],
})
export class SharedModule {}
