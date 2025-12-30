import { Module } from '@nestjs/common';
import { ListingManagementController } from './listing-management.controller';
import { AdminBoatListingHelperService } from './services/adminboat-listing-helper.service';
import { AdminCreateListingService } from './services/admincreate-listing.service';
import { ListingManagementService } from './services/listing-management.service';

@Module({
  controllers: [ListingManagementController],
  providers: [
    ListingManagementService,
    AdminCreateListingService,
    AdminBoatListingHelperService,
  ],
})
export class ListingManagementModule {}
