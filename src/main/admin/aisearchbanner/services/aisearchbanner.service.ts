import { PrismaService } from '@/lib/prisma/prisma.service';
import { S3Service } from '@/lib/s3/s3.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAISearchBannerDto } from '../dto/create-aisearchbanner.dto';
import { UpdateAISearchBannerDto } from '../dto/update-aisearchbanner.dto';

@Injectable()
export class AISearchBannerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  /** CREATE AI SEARCH BANNER */
  async create(dto: CreateAISearchBannerDto, file?: Express.Multer.File) {
    let uploadedFileId: string | null = null;

    if (file) {
      const uploadResult = await this.s3.uploadFiles([file]);
      uploadedFileId = uploadResult.data.files[0].id;
    }

    return this.prisma.client.aiSearchBanner.create({
      data: {
        bannerTitle: dto.bannerTitle,
        subtitle: dto.subtitle,
        site: dto.site,
        aiSearchBannerId: uploadedFileId,
      },
      include: {
        aiSearchBanner: true,
      },
    });
  }

  /** UPDATE AI SEARCH BANNER */
  async update(
    id: string,
    dto: UpdateAISearchBannerDto,
    file?: Express.Multer.File,
  ) {
    await this.findOne(id);

    let uploadedFileId: string | null = null;

    if (file) {
      const uploadResult = await this.s3.uploadFiles([file]);
      uploadedFileId = uploadResult.data.files[0].id;
    }

    return this.prisma.client.aiSearchBanner.update({
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
  }

  /** GET ALL AI SEARCH BANNERS */
  async findAll() {
    return this.prisma.client.aiSearchBanner.findMany({
      include: { aiSearchBanner: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** GET SINGLE AI SEARCH BANNER */
  async findOne(id: string) {
    const banner = await this.prisma.client.aiSearchBanner.findUnique({
      where: { id },
      include: { aiSearchBanner: true },
    });

    if (!banner) {
      throw new NotFoundException('AI search banner not found');
    }

    return banner;
  }

  /** DELETE AI SEARCH BANNER */
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.client.aiSearchBanner.delete({
      where: { id },
    });
  }
}
