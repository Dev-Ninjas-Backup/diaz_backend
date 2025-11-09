import { Module } from '@nestjs/common';
import { BoatsController } from './boats.controller';
import { GetBoatsService } from './services/get-boats.service';
import { GetSingleBoatService } from './services/get-single-boat.service';
import { GetAllBoatsService } from './services/get-all-boats.service';

@Module({
  controllers: [BoatsController],
  providers: [GetSingleBoatService, GetBoatsService, GetAllBoatsService],
})
export class BoatsModule {}
