import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { GetAdminUsersDto } from './dto/admin.dto';

@Injectable()
export class UserPermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAdminUsers(): Promise<GetAdminUsersDto[]> {
    return this.prisma.client.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN'],
        },
      },
    });
  }
}
