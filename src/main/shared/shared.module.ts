import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { BoatsModule } from './boats/boats.module';
import { ContactModule } from './contact/contact.module';
import { EmailSubscribeModule } from './email-subscribe/email-subscribe.module';
import { FaqModule } from './faq/faq.module';
import { FooterModule } from './footer/footer.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { VisitorModule } from './visitors/visitor.module';
import { WhyUsModule } from './why-us/why-us.module';

@Module({
  imports: [
    SubscriptionModule,
    AuthModule,
    BoatsModule,
    ContactModule,
    EmailSubscribeModule,
    FaqModule,
    FooterModule,
    VisitorModule,
    WhyUsModule,
  ],
  controllers: [],
  providers: [],
})
export class SharedModule {}
