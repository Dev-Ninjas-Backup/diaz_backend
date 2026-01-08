import { Module } from '@nestjs/common';
import { AboutUsModule } from './aboutus/aboutus.module';
import { AISearchBannerModule } from './aisearchbanner/aisearchbanner.module';
import { BoatsModule } from './boats/boats.module';
import { CategoryModule } from './category/category.module';
import { ContactUsModule } from './contactus/contactus.module';
import { BlogModule } from './content/blog/blog.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FeaturedBrandsModule } from './featuredbrands/featured-brands.module';
import { ListingManagementModule } from './listing-management/listing-management.module';
import { PackageBannerModule } from './packagebanner/packagebanner.module';
import { BannerModule } from './pagebanner/banner.module';
import { PrivacyPolicyModule } from './privacy-policy/privacy-policy.module';
import { SellerManagementModule } from './seller-management/seller-management.module';
import { SettingsModule } from './settings/settings.module';
import { TermsOfServiceModule } from './terms-of-service/terms-of-service.module';
import { UserPermissionsModule } from './users-permissions/user-permissions.module';

import { AdminSubscriptionModule } from './subscription/admin-subscription.module';

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
    FeaturedBrandsModule,
    PackageBannerModule,
    AISearchBannerModule,
    AboutUsModule,
    ContactUsModule,
    CategoryModule,
    AdminSubscriptionModule,
  ],
})
export class AdminModule {}
