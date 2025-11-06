import { Module } from '@nestjs/common';
import { BoatsModule } from './boats/boats.module';

@Module({
  imports: [BoatsModule],
  controllers: [],
  providers: [],
})
export class SellerModule {}
