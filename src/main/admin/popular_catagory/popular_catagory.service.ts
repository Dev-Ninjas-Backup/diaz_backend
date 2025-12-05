import { Injectable } from '@nestjs/common';

import { S3Service } from '@/lib/s3/s3.service';
import { PrismaService } from '@/lib/prisma/prisma.service';
import {
  CreatePopularCategoryDto,
  UpdatePopularCategoryDto,
} from './DTO/update cataergory.dto';

@Injectable()
export class PopularCategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileUploadService: S3Service,
  ) {}

  async create(dto: CreatePopularCategoryDto, files: Express.Multer.File[]) {
    let bannerImg: string | null = null;

    if (files && files.length > 0) {
      const upload = await this.fileUploadService.uploadFiles(files);
      bannerImg = upload.data.files[0].url;
    }

    return this.prisma.client.pOPULAR_CATAGORY.create({
      data: {
        title: dto.title,
        toggle: dto.toggle,
        bannerImg,
      },
    });
  }

  async findAll() {
    return this.prisma.client.pOPULAR_CATAGORY.findMany();
  }

  async findOne(id: number) {
    return this.prisma.client.pOPULAR_CATAGORY.findUnique({ where: { id } });
  }

  async update(
    id: number,
    dto: UpdatePopularCategoryDto,
    files: Express.Multer.File[],
  ) {
    let bannerImg: string | null = null;

    if (files && files.length > 0) {
      const upload = await this.fileUploadService.uploadFiles(files);
      bannerImg = upload.data.files[0].url;
    }

    return this.prisma.client.pOPULAR_CATAGORY.update({
      where: { id },
      data: {
        title: dto.title,
        toggle: dto.toggle,
        bannerImg: bannerImg ?? undefined,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.client.pOPULAR_CATAGORY.delete({ where: { id } });
  }
}
