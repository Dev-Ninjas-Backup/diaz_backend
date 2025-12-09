import { PrismaService } from '@/lib/prisma/prisma.service';
import { S3Service } from '@/lib/s3/s3.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePackageBannerDto } from '../dto/create-packagebanner.dto';
import { UpdatePackageBannerDto } from '../dto/update-packagebanner.dto';

@Injectable()
export class PackageBannerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  /** CREATE PACKAGE BANNER */
  async create(dto: CreatePackageBannerDto, file?: Express.Multer.File) {
    let uploadedFileId: string | null = null;

    if (file) {
      const uploadResult = await this.s3.uploadFiles([file]);
      uploadedFileId = uploadResult.data.files[0].id;
    }

    return this.prisma.client.packageBanner.create({
      data: {
        bannerTitle: dto.bannerTitle,
        subtitle: dto.subtitle,
        site: dto.site,
        packageBannerId: uploadedFileId,
      },
      include: {
        packageBanner: true,
      },
    });
  }

  /** UPDATE PACKAGE BANNER */
  async update(
    id: string,
    dto: UpdatePackageBannerDto,
    file?: Express.Multer.File,
  ) {
    await this.findOne(id);

    let uploadedFileId: string | null = null;

    if (file) {
      const uploadResult = await this.s3.uploadFiles([file]);
      uploadedFileId = uploadResult.data.files[0].id;
    }

    return this.prisma.client.packageBanner.update({
      where: { id },
      data: {
        bannerTitle: dto.bannerTitle ?? undefined,
        subtitle: dto.subtitle ?? undefined,
        packageBannerId: uploadedFileId ?? undefined,
      },
      include: {
        packageBanner: true,
      },
    });
  }

  /** GET ALL PACKAGE BANNERS */
  async findAll() {
    return this.prisma.client.packageBanner.findMany({
      include: { packageBanner: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** GET SINGLE PACKAGE BANNER */
  async findOne(id: string) {
    const banner = await this.prisma.client.packageBanner.findUnique({
      where: { id },
      include: { packageBanner: true },
    });

    if (!banner) {
      throw new NotFoundException('Package banner not found');
    }

    return banner;
  }

  /** DELETE PACKAGE BANNER */
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.client.packageBanner.delete({
      where: { id },
    });
  }
}
