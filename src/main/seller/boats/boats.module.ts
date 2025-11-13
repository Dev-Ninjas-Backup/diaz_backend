import { GetCustomBoatsService } from '@/main/shared/boats/services/get-custom-boats.service';
import { Module } from '@nestjs/common';
import { BoatsController } from './boats.controller';
import { BoatListingHelperService } from './services/boat-listing-helper.service';
import { BoatsService } from './services/boats.service';
import { CreateListingService } from './services/create-listing.service';
import { OnBoardingService } from './services/on-boarding.service';
import { UpdateListingService } from './services/update-listing.service';

@Module({
  controllers: [BoatsController],
  providers: [
    BoatsService,
    OnBoardingService,
    GetCustomBoatsService,
    CreateListingService,
    BoatListingHelperService,
    UpdateListingService,
  ],
  exports: [],
})
export class BoatsModule {}
