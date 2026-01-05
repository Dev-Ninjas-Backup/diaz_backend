import { MailModule } from '@/lib/mail/mail.module';
import { S3BucketModule } from '@/lib/s3/s3.module';
import { Module } from '@nestjs/common';
import { GetAllBoatsService } from '../boats/services/get-all-boats.service';
import { ContactController } from './contact.controller';
import { ContactInfoService } from './services/contact-info.service';
import { ContactService } from './services/contact.service';
import { CreateContactUsService } from './services/create-contact-us.service';
import { CreateContactService } from './services/create-contact.service';
import { GetContactUsService } from './services/get-contact-us.service';
import { UpdateContactStatusService } from './services/update-contact-status.service';

@Module({
  imports: [MailModule, S3BucketModule],
  controllers: [ContactController],
  providers: [
    ContactService,
    CreateContactService,
    CreateContactUsService,
    GetContactUsService,
    ContactInfoService,
    GetAllBoatsService,
    UpdateContactStatusService,
  ],
})
export class ContactModule {}
