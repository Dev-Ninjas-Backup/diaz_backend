import { Global, Module } from '@nestjs/common';
import { BoatsGroupService } from './services/boats-group.service';
import { GetAllCustomBoatsService } from './services/get-all-custom-boats.service';

@Global()
@Module({
  providers: [BoatsGroupService, GetAllCustomBoatsService],
  exports: [BoatsGroupService, GetAllCustomBoatsService],
})
export class BoatsGroupModule {}
