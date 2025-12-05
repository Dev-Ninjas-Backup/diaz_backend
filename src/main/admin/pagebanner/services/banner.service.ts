import { AppError } from '@/common/error/handle-error.app';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { S3Service } from '@/lib/s3/s3.service';
import { Injectable } from '@nestjs/common';
import { PageType, SiteType } from 'generated/enums';
import { CreateBannerDto } from '../dto/create-banner.dto';
import { UpdateBannerDto } from '../dto/update-banner.dto';

@Injectable()
export class BannerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  // -----------------------------
  // CREATE BANNER WITH FILE UPLOAD
  // -----------------------------
  async createBannerWithFiles(
    dto: CreateBannerDto,
    files: {
      logo?: Express.Multer.File[];
      background?: Express.Multer.File[];
    },
  ) {
    let logoId: string | null = null;
    let backgroundId: string | null = null;

    if (files.logo?.length) {
      const uploaded = await this.s3Service.uploadFiles([files.logo[0]]);
      logoId = uploaded.data.files[0].id;
    }

    if (files.background?.length) {
      const uploaded = await this.s3Service.uploadFiles([files.background[0]]);
      backgroundId = uploaded.data.files[0].id;
    }

    return this.prisma.client.pageBanner.create({
      data: {
        page: dto.page,
        site: dto.site,
        bannerTitle: dto.bannerTitle,
        subtitle: dto.subtitle,
        logoId,
        backgroundId,
      },
      include: { logo: true, background: true },
    });
  }

  async findAll() {
    return this.prisma.client.pageBanner.findMany({
      include: { logo: true, background: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneByPageAndSite(page: PageType, site: SiteType) {
    const banner = await this.prisma.client.pageBanner.findFirst({
      where: { page, site },
      include: { logo: true, background: true },
    });

    if (!banner) throw new AppError(404, 'Banner not found');

    return banner;
  }

  // ----------------------------------
  // UPDATE BANNER (OPTIONAL FILE UPLOAD)
  // ----------------------------------
  async updateBanner(
    id: string,
    dto: UpdateBannerDto,
    files: {
      logo?: Express.Multer.File[];
      background?: Express.Multer.File[];
    },
  ) {
    let logoId = dto.logoId;
    let backgroundId = dto.backgroundId;

    if (files.logo?.length) {
      const uploaded = await this.s3Service.uploadFiles([files.logo[0]]);
      logoId = uploaded.data.files[0].id;
    }

    if (files.background?.length) {
      const uploaded = await this.s3Service.uploadFiles([files.background[0]]);
      backgroundId = uploaded.data.files[0].id;
    }

    return this.prisma.client.pageBanner.update({
      where: { id },
      data: {
        page: dto.page,
        site: dto.site,
        bannerTitle: dto.bannerTitle,
        subtitle: dto.subtitle,
        logoId,
        backgroundId,
      },
      include: { logo: true, background: true },
    });
  }

  async deleteBanner(id: string) {
    return this.prisma.client.pageBanner.delete({
      where: { id },
    });
  }
}
