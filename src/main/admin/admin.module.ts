import { Module } from '@nestjs/common';
import { BoatsModule } from './boats/boats.module';
import { BlogModule } from './content/blog/blog.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ListingManagementModule } from './listing-management/listing-management.module';
import { BannerModule } from './pagebanner/banner.module';
import { PrivacyPolicyModule } from './privacy-policy/privacy-policy.module';
import { SellerManagementModule } from './seller-management/seller-management.module';
import { SettingsModule } from './settings/settings.module';
import { TermsOfServiceModule } from './terms-of-service/terms-of-service.module';
import { UserPermissionsModule } from './users-permissions/user-permissions.module';
import { PopularCategoryModule } from './popular_catagory/popular_catagory.module';

@Module({
  imports: [
    BoatsModule,
    TermsOfServiceModule,
    PrivacyPolicyModule,
    UserPermissionsModule,
    SellerManagementModule,
    BannerModule,
    BlogModule,
    DashboardModule,
    ListingManagementModule,
    SettingsModule,
    PopularCategoryModule,
  ],
})
export class AdminModule {}
