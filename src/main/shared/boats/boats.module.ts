import { Module } from '@nestjs/common';
import { BoatsController } from './boats.controller';
import { GetAllBoatsService } from './services/get-all-boats.service';
import { GetCustomBoatsService } from './services/get-custom-boats.service';

@Module({
  controllers: [BoatsController],
  providers: [GetCustomBoatsService, GetAllBoatsService],
})
export class BoatsModule {}
