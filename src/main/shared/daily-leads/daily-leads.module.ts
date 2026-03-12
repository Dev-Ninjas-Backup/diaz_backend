import { MailModule } from '@/lib/mail/mail.module';
import { Module } from '@nestjs/common';
import { DailyLeadsController } from './daily-leads.controller';
import { DailyLeadsService } from './daily-leads.service';

@Module({
  imports: [MailModule],
  controllers: [DailyLeadsController],
  providers: [DailyLeadsService],
  exports: [DailyLeadsService],
})
export class DailyLeadsModule {}
