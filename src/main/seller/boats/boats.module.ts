import { Module } from '@nestjs/common';
import { BoatsService } from './services/boats.service';
import { BoatsController } from './boats.controller';
import { OnBoardingService } from './services/on-boarding.service';

@Module({
  controllers: [BoatsController],
  providers: [BoatsService, OnBoardingService],
  exports: [],
})
export class BoatsModule {}
