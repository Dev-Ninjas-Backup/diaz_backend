import { Module } from '@nestjs/common';
import { BoatsSpecificationController } from './controllers/boats-specification.controller';
import { BoatsController } from './controllers/boats.controller';
import { TopViewedBoatsController } from './controllers/top-viewed-boats.controller';
import { BoatsFeatureService } from './services/boats-feature.service';
import { BoatsSpecificationService } from './services/boats-specification.service';
import { GetAllBoatsMergedService } from './services/get-all-boats-merged.service';
import { GetAllBoatsService } from './services/get-all-boats.service';
import { GetAllCustomBoatsFloridaService } from './services/get-all-custom-boats-florida.service';
import { GetCustomBoatsService } from './services/get-custom-boats.service';
import { TopViewedBoatsService } from './services/top-viewed-boats.service';
import { PremiumDealsFloridaService } from './services/premium-deals-florida.service';

@Module({
  controllers: [
    BoatsSpecificationController,
    BoatsController,
    TopViewedBoatsController,
  ],
  providers: [
    GetCustomBoatsService,
    GetAllBoatsService,
    BoatsSpecificationService,
    BoatsFeatureService,
    GetAllBoatsMergedService,
    GetAllCustomBoatsFloridaService,
    TopViewedBoatsService,
    PremiumDealsFloridaService,
  ],
})
export class BoatsModule {}
