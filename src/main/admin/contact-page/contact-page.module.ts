import { ContactController } from '@/main/shared/contact/contact.controller';
import { Module } from '@nestjs/common';
import { ContactPageService } from './contact-page.service';
import { ContactPageController } from './contact-page.controller';

@Module({
  controllers: [ContactPageController],
  providers: [ContactPageService],
})
export class ContactPageModule {}
