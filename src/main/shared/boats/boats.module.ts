import { Module } from '@nestjs/common';
import { BoatsSpecificationController } from './controllers/boats-specification.controller';
import { BoatsController } from './controllers/boats.controller';
import { BoatsSpecificationService } from './services/boats-specification.service';
import { GetAllBoatsService } from './services/get-all-boats.service';
import { GetCustomBoatsService } from './services/get-custom-boats.service';

@Module({
  controllers: [BoatsSpecificationController, BoatsController],
  providers: [
    GetCustomBoatsService,
    GetAllBoatsService,
    BoatsSpecificationService,
  ],
})
export class BoatsModule {}
