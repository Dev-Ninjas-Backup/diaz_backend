import { ENVEnum } from '@/common/enum/env.enum';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { UtilsService } from '@/lib/utils/utils.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SuperAdminService implements OnModuleInit {
  private readonly logger = new Logger(SuperAdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit(): Promise<void> {
    return this.seedSuperAdminUser();
  }

  async seedSuperAdminUser(): Promise<void> {
    const superAdminEmail = this.configService.getOrThrow<string>(
      ENVEnum.SUPER_ADMIN_EMAIL,
    );
    const superAdminPass = this.configService.getOrThrow<string>(
      ENVEnum.SUPER_ADMIN_PASS,
    );

    const superAdminExists = await this.prisma.client.user.findFirst({
      where: {
        email: superAdminEmail,
      },
    });

    // * create super admin
    if (!superAdminExists) {
      const usernameExists = await this.prisma.client.user.findUnique({
        where: {
          username: 'superadmin',
        },
      });

      if (usernameExists) {
        this.logger.warn(
          `Username 'superadmin' already exists. Updating existing user to super admin role.`,
        );
        await this.prisma.client.user.update({
          where: {
            username: 'superadmin',
          },
          data: {
            email: superAdminEmail,
            password: await this.utils.hash(superAdminPass),
            name: 'Super Admin',
            role: 'SUPER_ADMIN',
            isVerified: true,
          },
        });
        this.logger.log(
          `[UPDATE] User with username 'superadmin' updated to Super Admin with email: ${superAdminEmail}`,
        );
        return;
      }

      try {
        await this.prisma.client.user.create({
          data: {
            email: superAdminEmail,
            username: 'superadmin',
            password: await this.utils.hash(superAdminPass),
            name: 'Super Admin',
            role: 'SUPER_ADMIN',
            isVerified: true,
          },
        });
        this.logger.log(
          `[CREATE] Super Admin user created with email: ${superAdminEmail}`,
        );
      } catch (error: any) {
        // Handle unique constraint errors gracefully
        if (error.code === 'P2002') {
          this.logger.warn(
            `User with email ${superAdminEmail} or username 'superadmin' already exists. Skipping creation.`,
          );
        } else {
          throw error;
        }
      }
      return;
    }

    // * Log & update if super admin already exists
    await this.prisma.client.user.update({
      where: {
        email: superAdminEmail,
      },
      data: {
        isVerified: true,
        role: 'SUPER_ADMIN',
      },
    });

    this.logger.log(
      `[UPDATE] Super Admin user updated with email: ${superAdminEmail}`,
    );
  }
}
