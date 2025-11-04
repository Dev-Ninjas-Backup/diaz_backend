import { Module } from '@nestjs/common';
import { BoatsController } from './boats.controller';
import { BoatsService } from './services/boats.service';

@Module({
  controllers: [BoatsController],
  providers: [BoatsService],
  exports: [],
})
export class BoatsModule {}
