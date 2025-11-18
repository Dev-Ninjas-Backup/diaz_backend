import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthLoginService } from './services/auth-login.service';
import { AuthNotificationService } from './services/auth-notification.service';
import { AuthProfileService } from './services/auth-profile.service';

@Module({
  controllers: [AuthController],
  providers: [AuthLoginService, AuthProfileService, AuthNotificationService],
})
export class AuthModule {}
