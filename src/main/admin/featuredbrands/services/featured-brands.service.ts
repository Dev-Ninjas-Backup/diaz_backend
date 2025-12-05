import { PrismaService } from '@/lib/prisma/prisma.service';
import { S3Service } from '@/lib/s3/s3.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFeaturedBrandDto } from '../dto/create-featured-brand.dto';
import { UpdateFeaturedBrandDto } from '../dto/update-featured-brand.dto';

@Injectable()
export class FeaturedBrandsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  async create(
    dto: CreateFeaturedBrandDto,
    featuredbrandLogo?: Express.Multer.File,
  ) {
    let featuredbrandId: string | null = null;

    if (featuredbrandLogo) {
      const uploaded = await this.s3.uploadFiles([featuredbrandLogo]);
      featuredbrandId = uploaded.data.files[0].id;
    }
    const createData: any = {
      Site: dto.site,
      featuredbrandId: featuredbrandId ?? undefined,
    };

    return this.prisma.client.featuredBrands.create({
      data: createData as any,
      include: {
        featuredbrandLogo: true,
      },
    });
  }

  async update(
    id: string,
    dto: UpdateFeaturedBrandDto,
    featuredbrandLogo?: Express.Multer.File,
  ) {
    await this.findOne(id);

    let newFileId: string | undefined;

    if (featuredbrandLogo) {
      const uploaded = await this.s3.uploadFiles([featuredbrandLogo]);
      newFileId = uploaded.data.files[0].id;
    }

    const updateData: any = {
      featuredbrandId: newFileId ?? undefined,
      Site: dto.site ?? undefined,
    };

    return this.prisma.client.featuredBrands.update({
      where: { id },
      data: updateData as any,
      include: { featuredbrandLogo: true },
    });
  }

  async findAll() {
    return this.prisma.client.featuredBrands.findMany({
      include: { featuredbrandLogo: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const brand = await this.prisma.client.featuredBrands.findUnique({
      where: { id },
      include: { featuredbrandLogo: true },
    });

    if (!brand) throw new NotFoundException('Featured brand not found');
    return brand;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.client.featuredBrands.delete({
      where: { id },
    });
  }
}
