import { GetCustomBoatsService } from '@/main/shared/boats/services/get-custom-boats.service';
import { Module } from '@nestjs/common';
import { BoatsController } from './boats.controller';
import { BoatsService } from './services/boats.service';
import { OnBoardingService } from './services/on-boarding.service';
import { CreateListingService } from './services/create-listing.service';

@Module({
  controllers: [BoatsController],
  providers: [
    BoatsService,
    OnBoardingService,
    GetCustomBoatsService,
    CreateListingService,
  ],
  exports: [],
})
export class BoatsModule {}
