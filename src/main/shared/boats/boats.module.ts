import { Module } from '@nestjs/common';
import { BoatsSpecificationController } from './controllers/boats-specification.controller';
import { BoatsController } from './controllers/boats.controller';
import { BoatsFeatureService } from './services/boats-feature.service';
import { BoatsSpecificationService } from './services/boats-specification.service';
import { GetAllBoatsMergedService } from './services/get-all-boats-merged.servcie';
import { GetAllBoatsService } from './services/get-all-boats.service';
import { GetCustomBoatsService } from './services/get-custom-boats.service';

@Module({
  controllers: [BoatsSpecificationController, BoatsController],
  providers: [
    GetCustomBoatsService,
    GetAllBoatsService,
    BoatsSpecificationService,
    BoatsFeatureService,
    GetAllBoatsMergedService,
  ],
})
export class BoatsModule {}
