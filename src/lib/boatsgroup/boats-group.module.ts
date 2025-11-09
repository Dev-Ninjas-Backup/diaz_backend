import { GetBoatsService } from '@/main/shared/boats/services/get-boats.service';
import { Global, Module } from '@nestjs/common';
import { BoatsGroupService } from './boats-group.service';

@Global()
@Module({
  providers: [BoatsGroupService, GetBoatsService],
  exports: [BoatsGroupService],
})
export class BoatsGroupModule {}
