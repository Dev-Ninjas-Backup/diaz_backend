import { PrismaService } from '@/lib/prisma/prisma.service';
import { S3Service } from '@/lib/s3/s3.service';
import { Injectable } from '@nestjs/common';
import { UpdateSettingsDto } from '../dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  private async getOrCreate() {
    let settings = await this.prisma.client.setting.findFirst({
      include: { logo: true },
    });

    if (!settings) {
      settings = await this.prisma.client.setting.create({
        data: {
          siteName: 'Florida Yacht Trader',
          currency: 'USD',
        },
        include: { logo: true },
      });
    }

    return settings;
  }

  async getSettings() {
    const settings = await this.getOrCreate();

    return {
      ...settings,
      logoUrl: settings.logo?.url ?? null,
    };
  }

  async updateSettings(dto: UpdateSettingsDto, file?: Express.Multer.File) {
    const settings = await this.getOrCreate();

    let fileRecord = null;

    if (file) {
      const uploaded = await this.s3.uploadFiles([file]);
      fileRecord = uploaded.data.files[0];
    }

    const { logo, ...prismaData } = dto as any;

    return this.prisma.client.setting.update({
      where: { id: settings.id },
      data: {
        ...prismaData,
        logoId: fileRecord?.id ?? settings.logoId,
      },
      include: { logo: true },
    });
  }
}
