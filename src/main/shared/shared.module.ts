import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BoatsModule } from './boats/boats.module';
import { ContactModule } from './contact/contact.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { VisitorModule } from './visitors/visitor.module';

@Module({
  imports: [
    SubscriptionModule,
    AuthModule,
    BoatsModule,
    ContactModule,
    VisitorModule,
  ],
  controllers: [],
  providers: [],
})
export class SharedModule {}
