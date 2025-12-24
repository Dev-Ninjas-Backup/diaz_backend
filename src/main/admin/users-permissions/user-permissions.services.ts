import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateAdminUserDto, GetAdminUsersDto } from './dto/admin.dto';
import { changeRole } from './enum/changerole.enum';
import { UserStatus } from 'generated/enums';

@Injectable()
export class UserPermissionsService {
  constructor(private readonly prisma: PrismaService) {}

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
    return this.prisma.client.user.create({
      data: { ...createAdminUserDto, isVerified: true },
    });
  }

  async changeRole(id: string, role: changeRole) {
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
