import { Module } from '@nestjs/common';
import { UserPermissionsController } from './user-permissions.controller';
import { UserPermissionsService } from './user-permissions.services';
import { PrismaService } from '@/lib/prisma/prisma.service';

@Module({
  controllers: [UserPermissionsController],
  providers: [UserPermissionsService, PrismaService],
})
export class UserPermissionsModule {}
