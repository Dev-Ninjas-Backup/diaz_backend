import { PaginationDto } from '@/common/dto/pagination.dto';
import { GetUser, Public, ValidateAuth } from '@/common/jwt/jwt.decorator';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthLoginService } from './services/auth-login.service';
import { AuthNotificationService } from './services/auth-notification.service';
import { AuthPasswordService } from './services/auth-password.service';
import { AuthProfileService } from './services/auth-profile.service';
import { AuthUpdateProfileService } from './services/auth-update-profile.service';

@ApiTags('Shared -- Auth, Profile & Notification')
@ApiBearerAuth()
@ValidateAuth()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginService: AuthLoginService,
    private readonly profileService: AuthProfileService,
    private readonly updateProfileService: AuthUpdateProfileService,
    private readonly authPasswordService: AuthPasswordService,
    private readonly notificationService: AuthNotificationService,
  ) {}

  @ApiOperation({ summary: 'User login (Public)' })
  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.loginService.login(dto);
  }

  @ApiOperation({ summary: 'Get user profile' })
  @Get('profile')
  async getProfile(@GetUser('sub') userId: string) {
    return this.profileService.getProfile(userId);
  }

  @ApiOperation({ summary: 'Update profile' })
  @ApiConsumes('multipart/form-data')
  @Patch('profile')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @GetUser('sub') id: string,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.updateProfileService.updateProfile(id, dto, file);
  }

  @ApiOperation({ summary: 'Change Password' })
  @Post('change-password')
  async changePassword(
    @GetUser('sub') userId: string,
    @Body() body: ChangePasswordDto,
  ) {
    return this.authPasswordService.changePassword(userId, body);
  }

  @ApiOperation({ summary: 'Forgot Password (Public)' })
  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authPasswordService.forgotPassword(dto.email);
  }

  @ApiOperation({ summary: 'Reset Password (Public)' })
  @Public()
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authPasswordService.resetPassword(dto);
  }

  @ApiOperation({ summary: 'Get user notification' })
  @Get('notification')
  async getNotification(
    @GetUser('sub') userId: string,
    @Query() query: PaginationDto,
  ) {
    return this.notificationService.getOwnNotification(userId, query);
  }

  @ApiOperation({ summary: 'Mark notification as read' })
  @Patch('notification/mark-as-read/:notificationId')
  async markAsRead(
    @GetUser('sub') userId: string,
    @Param('notificationId') notificationId: string,
  ) {
    return this.notificationService.markAsRead(userId, notificationId);
  }

  @ApiOperation({ summary: 'Mark all notification as read' })
  @Patch('notification/mark-all-as-read')
  async markAllAsRead(@GetUser('sub') userId: string) {
    return this.notificationService.markAllAsRead(userId);
  }
}
