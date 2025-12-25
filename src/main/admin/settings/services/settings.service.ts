import { PrismaService } from '@/lib/prisma/prisma.service';
import { S3Service } from '@/lib/s3/s3.service';
import { Injectable, Logger } from '@nestjs/common';
import { UpdateSettingsDto } from '../dto/update-settings.dto';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  private async getOrCreate() {
    try {
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
        this.logger.log('Created default settings');
      }

      return settings;
    } catch (error) {
      this.logger.error('Failed to get or create settings', error);
      throw error;
    }
  }

  async getSettings() {
    try {
      const settings = await this.getOrCreate();

      return {
        ...settings,
        logoUrl: settings.logo?.url ?? null,
      };
    } catch (error) {
      this.logger.error('Failed to get settings', error);
      throw error;
    }
  }

  async updateSettings(dto: UpdateSettingsDto, file?: Express.Multer.File) {
    try {
      const settings = await this.getOrCreate();

      let logoId: string | null = settings.logoId;

      if (file && file.size > 0) {
        try {
          const uploaded = await this.s3.uploadFiles([file]);
          logoId = uploaded.data.files[0].id;
          this.logger.log(`Logo uploaded successfully: ${logoId}`);
        } catch (error) {
          this.logger.error('Failed to upload logo file', error);
          throw new Error('Failed to upload logo file');
        }
      }

      // Exclude 'logo' field as it's handled separately via file upload
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { logo, ...updateData } = dto;

      // Filter out undefined values to avoid overwriting with undefined
      const filteredData = Object.fromEntries(
        Object.entries(updateData).filter(([, value]) => value !== undefined),
      );

      const updatedSettings = await this.prisma.client.setting.update({
        where: { id: settings.id },
        data: {
          ...filteredData,
          logoId,
        },
        include: { logo: true },
      });

      this.logger.log(`Settings updated successfully: ${settings.id}`);
      return updatedSettings;
    } catch (error) {
      this.logger.error('Failed to update settings', error);
      throw error;
    }
  }
}
