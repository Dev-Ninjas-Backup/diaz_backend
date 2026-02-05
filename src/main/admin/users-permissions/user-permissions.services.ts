import { PrismaService } from '@/lib/prisma/prisma.service';
import { UtilsService } from '@/lib/utils/utils.service';
import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from 'generated/client';
import { UserStatus } from 'generated/enums';
import {
  AdminUserResponseDto,
  CreateAdminUserDto,
  GetAdminUsersDto,
} from './dto/admin.dto';
import { changeRole } from './enum/changerole.enum';

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
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatarUrl: true,
        role: true,
        status: true,
        isLoggedIn: true,
        lastLoginAt: true,
        lastActiveAt: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        phone: true,
        country: true,
        city: true,
        state: true,
        zip: true,
      },
    });
  }

  async addAdmin(
    createAdminUserDto: CreateAdminUserDto,
  ): Promise<AdminUserResponseDto> {
    try {
      const { password, email, username, ...rest } = createAdminUserDto;

      const existingEmail = await this.prisma.client.user.findUnique({
        where: { email },
      });

      if (existingEmail) {
        throw new ConflictException(
          `Email '${email}' is already registered. Please use a different email address.`,
        );
      }

      const existingUsername = await this.prisma.client.user.findUnique({
        where: { username },
      });

      if (existingUsername) {
        throw new ConflictException(
          `Username '${username}' is already taken. Please choose a different username.`,
        );
      }

      const hashedPassword = await this.utils.hash(password);

      const user = await this.prisma.client.user.create({
        data: {
          email,
          username,
          ...rest,
          password: hashedPassword,
          isVerified: true,
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...userWithoutPassword } = user;
      return userWithoutPassword as AdminUserResponseDto;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = error.meta?.target as string[] | undefined;
          if (target?.includes('email')) {
            throw new ConflictException(
              `Email '${createAdminUserDto.email}' is already registered. Please use a different email address.`,
            );
          }
          if (target?.includes('username')) {
            throw new ConflictException(
              `Username '${createAdminUserDto.username}' is already taken. Please choose a different username.`,
            );
          }
          throw new ConflictException(
            'A user with this information already exists.',
          );
        }
        throw new ConflictException(`Database error: ${error.message}`);
      }

      throw new ConflictException(
        `Failed to create admin user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
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
