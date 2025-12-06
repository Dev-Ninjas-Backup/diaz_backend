import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateAdminUserDto, GetAdminUsersDto } from './dto/admin.dto';
import { UserRole, UserStatus } from 'generated/enums';
import { UtilsService } from '@/lib/utils/utils.service';

@Injectable()
export class UserPermissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService,
  ) {}

  async getAdmins(): Promise<GetAdminUsersDto[]> {
    return this.prisma.client.user.findMany({
      where: {
        AND: [
          {
            role: {
              in: ['ADMIN', 'SUPER_ADMIN'],
            },
          },
          {
            status: {
              in: ['ACTIVE'],
            },
          },
        ],
      },
    });
  }

  async addAdmin(createAdminUserDto: CreateAdminUserDto) {
    const hashedPassword = await this.utils.hash(createAdminUserDto.password);
    return this.prisma.client.user.create({
      data: {
        ...createAdminUserDto,
        isVerified: true,
        password: hashedPassword,
      },
    });
  }

  async changeRole(id: string, role: UserRole) {
    return this.prisma.client.user.update({
      where: { id },
      data: {
        role: role,
      },
    });
  }

  async deleteAdmin(id: string) {
    return this.prisma.client.user.update({
      where: { id },
      data: {
        status: UserStatus.DELETED,
      },
    });
  }
}
