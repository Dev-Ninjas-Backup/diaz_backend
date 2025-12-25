import { Module } from '@nestjs/common';
import { BoatsSpecificationController } from './controllers/boats-specification.controller';
import { BoatsController } from './controllers/boats.controller';
import { FeaturedYachtController } from './controllers/featured-yacht.controller';
import { TopViewedBoatsController } from './controllers/top-viewed-boats.controller';
import { BoatsFeatureService } from './services/boats-feature.service';
import { BoatsSpecificationService } from './services/boats-specification.service';
import { FeaturedYachtService } from './services/featured-yacht.service';
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
    FeaturedYachtController,
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
    FeaturedYachtService,
  ],
})
export class BoatsModule {}
