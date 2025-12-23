import { Module } from '@nestjs/common';
import { MailModule } from '@/lib/mail/mail.module';
import { GetAllBoatsService } from '../boats/services/get-all-boats.service';
import { ContactController } from './contact.controller';
import { ContactService } from './services/contact.service';
import { CreateContactService } from './services/create-contact.service';
import { CreateContactUsService } from './services/create-contact-us.service';

@Module({
  imports: [MailModule],
  controllers: [ContactController],
  providers: [
    ContactService,
    CreateContactService,
    CreateContactUsService,
    GetAllBoatsService,
  ],
})
export class ContactModule {}
