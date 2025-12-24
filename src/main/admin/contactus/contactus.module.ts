import { Module } from '@nestjs/common';
import { ContactUsController } from './contactus.controller';
import { ContactUsService } from './services/contactus.service';

@Module({
  controllers: [ContactUsController],
  providers: [ContactUsService],
})
export class ContactUsModule {}
