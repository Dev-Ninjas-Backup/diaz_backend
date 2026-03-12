import { Module } from '@nestjs/common';
import { AboutUsModule } from './about-us/about-us.module';
import { AuthModule } from './auth/auth.module';
import { BoatsModule } from './boats/boats.module';
import { ContactModule } from './contact/contact.module';
import { DailyLeadsModule } from './daily-leads/daily-leads.module';
import { EmailSubscribeModule } from './email-subscribe/email-subscribe.module';
import { FaqModule } from './faq/faq.module';
import { FooterModule } from './footer/footer.module';
import { OurTeamModule } from './our-team/our-team.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { VisitorModule } from './visitors/visitor.module';
import { WhyUsModule } from './why-us/why-us.module';

@Module({
  imports: [
    SubscriptionModule,
    AuthModule,
    BoatsModule,
    ContactModule,
    DailyLeadsModule,
    EmailSubscribeModule,
    FaqModule,
    FooterModule,
    VisitorModule,
    WhyUsModule,
    OurTeamModule,
    AboutUsModule,
  ],
  controllers: [],
  providers: [],
})
export class SharedModule {}
