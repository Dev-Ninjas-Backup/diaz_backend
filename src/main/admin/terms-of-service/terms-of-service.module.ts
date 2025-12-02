import { Module } from '@nestjs/common';
import { TermsOfServiceController } from './terms-of-service.controller';
import { TermsofServicesService } from './terms-of-service.service';

@Module({
  imports: [],
  controllers: [TermsOfServiceController],
  providers: [TermsofServicesService],
})
export class TermsOfServiceModule {}
