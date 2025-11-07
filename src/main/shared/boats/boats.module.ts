import { Module } from '@nestjs/common';
import { BoatsController } from './boats.controller';
import { BoatsService } from './services/boats.service';
import { GetBoatsService } from './services/get-boats.service';

@Module({
  controllers: [BoatsController],
  providers: [BoatsService, GetBoatsService],
})
export class BoatsModule {}
