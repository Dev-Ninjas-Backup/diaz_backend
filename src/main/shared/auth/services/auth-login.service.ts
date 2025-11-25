import { UserResponseDto } from '@/common/dto/user-response.dto';
import { AppError } from '@/common/error/handle-error.app';
import { HandleError } from '@/common/error/handle-error.decorator';
import { successResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { UtilsService } from '@/lib/utils/utils.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthLoginService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService,
  ) {}

  @HandleError('Failed to login user', 'User')
  async login(dto: LoginDto) {
    const user = await this.prisma.client.user.findUniqueOrThrow({
      where: { email: dto.email },
    });

    const isPasswordCorrect = await this.utils.compare(
      dto.password,
      user.password,
    );

    if (!isPasswordCorrect) {
      throw new AppError(HttpStatus.UNAUTHORIZED, 'Invalid password');
    }

    const updatedUser = await this.prisma.client.user.update({
      where: { id: user.id },
      data: { isLoggedIn: true, lastLoginAt: new Date() },
    });

    const token = this.utils.generateToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return successResponse(
      {
        user: this.utils.sanitizedResponse(UserResponseDto, updatedUser),
        token,
      },
      'Logged in successfully',
    );
  }
}
