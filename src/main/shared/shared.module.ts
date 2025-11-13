import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BoatsModule } from './boats/boats.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { ContactModule } from './contact/contact.module';

@Module({
  imports: [SubscriptionModule, AuthModule, BoatsModule, ContactModule],
  controllers: [],
  providers: [],
})
export class SharedModule {}
