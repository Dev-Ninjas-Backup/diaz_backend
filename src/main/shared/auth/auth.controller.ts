import { PaginationDto } from '@/common/dto/pagination.dto';
import { GetUser, Public, ValidateAuth } from '@/common/jwt/jwt.decorator';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { AuthLoginService } from './services/auth-login.service';
import { AuthNotificationService } from './services/auth-notification.service';
import { AuthProfileService } from './services/auth-profile.service';

@ApiTags('Shared -- Auth, Profile & Notification')
@ApiBearerAuth()
@ValidateAuth()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginService: AuthLoginService,
    private readonly profileService: AuthProfileService,
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

  @ApiOperation({ summary: 'Get user notification' })
  @Get('notification')
  async getNotification(
    @GetUser('sub') userId: string,
    @Query() query: PaginationDto,
  ) {
    return this.notificationService.getOwnNotification(userId, query);
  }

  @ApiOperation({ summary: 'Mark notification as read' })
  @Get('notification/mark-as-read/:notificationId')
  async markAsRead(
    @GetUser('sub') userId: string,
    @Param('notificationId') notificationId: string,
  ) {
    return this.notificationService.markAsRead(userId, notificationId);
  }

  @ApiOperation({ summary: 'Mark all notification as read' })
  @Get('notification/mark-all-as-read')
  async markAllAsRead(@GetUser('sub') userId: string) {
    return this.notificationService.markAllAsRead(userId);
  }
}
