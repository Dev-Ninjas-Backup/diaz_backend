import { Global, Module } from '@nestjs/common';
import { BoatsGroupService } from './boats-group.service';

@Global()
@Module({
  providers: [BoatsGroupService],
  exports: [BoatsGroupService],
})
export class BoatsGroupModule {}
