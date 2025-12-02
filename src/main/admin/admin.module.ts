import { Module } from '@nestjs/common';
import { BoatsModule } from './boats/boats.module';
import { TermsOfServiceModule } from './terms-of-service/terms-of-service.module';
import { PrivacyPolicyModule } from './privacy-policy/privacy-policy.module';
import { UserPermissionsModule } from './users-permissions/user-permissions.module';
import { SellerManagementModule } from './seller-management/seller-management.module';

@Module({
  imports: [
    BoatsModule,
    TermsOfServiceModule,
    PrivacyPolicyModule,
    UserPermissionsModule,
    SellerManagementModule,
  ],
})
export class AdminModule {}
