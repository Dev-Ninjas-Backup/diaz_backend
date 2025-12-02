import { Module } from '@nestjs/common';
import { BoatsModule } from './boats/boats.module';
import { BlogModule } from './content/blog/blog.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ListingManagementModule } from './listing-management/listing-management.module';
import { BannerModule } from './pagebanner/banner.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    BoatsModule,
    BannerModule,
    BlogModule,
    DashboardModule,
    ListingManagementModule,
    SettingsModule,
  ],
})
export class AdminModule {}
