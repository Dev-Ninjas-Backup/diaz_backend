import { Module } from '@nestjs/common';
import { GetAllBoatsService } from '../boats/services/get-all-boats.service';
import { ContactController } from './contact.controller';
import { ContactService } from './services/contact.service';
import { CreateContactService } from './services/create-contact.service';

@Module({
  controllers: [ContactController],
  providers: [ContactService, CreateContactService, GetAllBoatsService],
})
export class ContactModule {}
