import { GetUser, ValidateAuth } from '@/common/jwt/jwt.decorator';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { AuthLoginService } from './services/auth-login.service';
import { AuthProfileService } from './services/auth-profile.service';

@ApiTags('Shared -- Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginService: AuthLoginService,
    private readonly profileService: AuthProfileService,
  ) {}

  @ApiOperation({ summary: 'User login' })
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.loginService.login(dto);
  }

  @ApiOperation({ summary: 'Get user profile' })
  @ApiBearerAuth()
  @ValidateAuth()
  @Get('profile')
  async getProfile(@GetUser('sub') userId: string) {
    return this.profileService.getProfile(userId);
  }
}
