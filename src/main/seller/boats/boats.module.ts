import { GetCustomBoatsService } from '@/main/shared/boats/services/get-custom-boats.service';
import { Module } from '@nestjs/common';
import { BoatsController } from './boats.controller';
import { BoatsService } from './services/boats.service';
import { OnBoardingService } from './services/on-boarding.service';

@Module({
  controllers: [BoatsController],
  providers: [BoatsService, OnBoardingService, GetCustomBoatsService],
  exports: [],
})
export class BoatsModule {}
