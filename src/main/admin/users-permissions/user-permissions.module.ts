import { Module } from '@nestjs/common';
import { UserPermissionsController } from './user-permissions.controller';
import { UserPermissionsService } from './user-permissions.services';

@Module({
  controllers: [UserPermissionsController],
  providers: [UserPermissionsService],
})
export class UserPermissionsModule {}
