import { Global, Module } from '@nestjs/common';
import { BoatsFeatureService } from './services/boats-feature.service';
import { BoatsSpecificationService } from './services/boats-specification.service';
import { FileService } from './services/file.service';
import { SubscriptionPlanService } from './services/subscription-plan.service';
import { SuperAdminService } from './services/super-admin.service';

@Global()
@Module({
  imports: [],
  providers: [
    SuperAdminService,
    FileService,
    SubscriptionPlanService,
    BoatsSpecificationService,
    BoatsFeatureService,
  ],
})
export class SeedModule {}
