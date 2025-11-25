import { UserResponseDto } from '@/common/dto/user-response.dto';
import { HandleError } from '@/common/error/handle-error.decorator';
import { successResponse, TResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { UtilsService } from '@/lib/utils/utils.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService,
  ) {}

  @HandleError("Can't get user profile")
  async getProfile(userId: string) {
    const user = await this.findUserBy('id', userId);
    return user;
  }

  private async findUserBy(
    key: 'id' | 'email',
    value: string,
  ): Promise<TResponse<any>> {
    const where: any = {};
    where[key] = value;

    const user = await this.prisma.client.user.findUniqueOrThrow({ where });

    const sanitizedUser = this.utils.sanitizedResponse(UserResponseDto, user);

    return successResponse(sanitizedUser, 'User data fetched successfully');
  }
}
