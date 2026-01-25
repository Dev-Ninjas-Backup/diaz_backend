import { HandleError } from '@/common/error/handle-error.decorator';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { S3Service } from '@/lib/s3/s3.service';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateAISearchBannerDto } from '../dto/create-aisearchbanner.dto';
import { UpdateAISearchBannerDto } from '../dto/update-aisearchbanner.dto';

@Injectable()
export class AISearchBannerService {
  private readonly logger = new Logger(AISearchBannerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  @HandleError('Failed to create AI search banner', 'AI Search Banner')
  async create(dto: CreateAISearchBannerDto, file?: Express.Multer.File) {
    try {
      const existingBanner = await this.prisma.client.aiSearchBanner.findFirst({
        where: { site: 'JUPITER' },
      });

      if (existingBanner) {
        throw new Error(
          'AI Search Banner already exists for JUPITER site. Only one banner is allowed. Please update the existing banner instead.',
        );
      }

      let uploadedFileId: string | null = null;

      if (file) {
        try {
          const uploadResult = await this.s3.uploadFiles([file]);
          uploadedFileId = uploadResult.data.files[0].id;
          this.logger.log(`File uploaded successfully: ${uploadedFileId}`);
        } catch (error) {
          this.logger.error(
            `Failed to upload file: ${error.message}`,
            error.stack,
          );
          throw error;
        }
      }

      try {
        const banner = await this.prisma.client.aiSearchBanner.create({
          data: {
            bannerTitle: dto.bannerTitle,
            subtitle: dto.subtitle,
            site: 'JUPITER',
            aiSearchBannerId: uploadedFileId,
          },
          include: {
            aiSearchBanner: true,
          },
        });

        this.logger.log(
          `AI Search Banner created successfully: ${banner.id} for JUPITER site`,
        );
        return banner;
      } catch (error) {
        this.logger.error(
          `Failed to create AI Search Banner: ${error.message}`,
          error.stack,
        );
        throw error;
      }
    } catch (error) {
      this.logger.error(
        `Failed to create AI Search Banner: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @HandleError('Failed to update AI search banner', 'AI Search Banner')
  async update(
    id: string,
    dto: UpdateAISearchBannerDto,
    file?: Express.Multer.File,
  ) {
    try {
      await this.findOne(id);

      let uploadedFileId: string | null = null;

      if (file) {
        try {
          const uploadResult = await this.s3.uploadFiles([file]);
          uploadedFileId = uploadResult.data.files[0].id;
          this.logger.log(
            `File uploaded successfully for update: ${uploadedFileId}`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to upload file for update: ${error.message}`,
            error.stack,
          );
          throw error;
        }
      }

      try {
        const banner = await this.prisma.client.aiSearchBanner.update({
          where: { id },
          data: {
            bannerTitle: dto.bannerTitle ?? undefined,
            subtitle: dto.subtitle ?? undefined,
            aiSearchBannerId: uploadedFileId ?? undefined,
          },
          include: {
            aiSearchBanner: true,
          },
        });

        this.logger.log(`AI Search Banner updated successfully: ${id}`);
        return banner;
      } catch (error) {
        this.logger.error(
          `Failed to update AI Search Banner: ${error.message}`,
          error.stack,
        );
        throw error;
      }
    } catch (error) {
      this.logger.error(
        `Failed to update AI Search Banner: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @HandleError('Failed to get AI search banner', 'AI Search Banner')
  async findAll() {
    try {
      const banner = await this.prisma.client.aiSearchBanner.findFirst({
        where: { site: 'JUPITER' },
        include: { aiSearchBanner: true },
      });

      if (!banner) {
        this.logger.log('No AI Search Banner found for JUPITER site');
        return {
          message: 'No AI Search Banner found for JUPITER site',
          data: [],
        };
      }

      this.logger.log('Retrieved AI Search Banner for JUPITER site');
      return {
        message: 'AI Search Banner retrieved successfully',
        data: [banner],
      };
    } catch (error) {
      this.logger.error(
        `Failed to get AI Search Banner: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @HandleError('Failed to get AI search banner', 'AI Search Banner')
  async findOne(id: string) {
    try {
      const banner = await this.prisma.client.aiSearchBanner.findUnique({
        where: { id },
        include: { aiSearchBanner: true },
      });

      if (!banner) {
        this.logger.warn(`AI Search Banner not found: ${id}`);
        throw new NotFoundException('AI search banner not found');
      }

      this.logger.log(`Retrieved AI Search Banner: ${id}`);
      return banner;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to get AI Search Banner: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @HandleError('Failed to delete AI search banner', 'AI Search Banner')
  async remove(id: string) {
    try {
      await this.findOne(id);

      try {
        const deleted = await this.prisma.client.aiSearchBanner.delete({
          where: { id },
        });

        this.logger.log(`AI Search Banner deleted successfully: ${id}`);
        return deleted;
      } catch (error) {
        this.logger.error(
          `Failed to delete AI Search Banner: ${error.message}`,
          error.stack,
        );
        throw error;
      }
    } catch (error) {
      this.logger.error(
        `Failed to remove AI Search Banner: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
