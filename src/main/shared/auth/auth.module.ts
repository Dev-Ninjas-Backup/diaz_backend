import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthLoginService } from './services/auth-login.service';
import { AuthNotificationService } from './services/auth-notification.service';
import { AuthPasswordService } from './services/auth-password.service';
import { AuthProfileService } from './services/auth-profile.service';
import { AuthUpdateProfileService } from './services/auth-update-profile.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthLoginService,
    AuthProfileService,
    AuthNotificationService,
    AuthUpdateProfileService,
    AuthPasswordService,
  ],
})
export class AuthModule {}
