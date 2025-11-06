import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthLoginService } from './services/auth-login.service';
import { AuthProfileService } from './services/auth-profile.service';

@Module({
  controllers: [AuthController],
  providers: [AuthLoginService, AuthProfileService],
})
export class AuthModule {}
