import { PrismaService } from '@/lib/prisma/prisma.service';
import { S3Service } from '@/lib/s3/s3.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  async create(dto: CreateCategoryDto, image?: Express.Multer.File) {
    let imageId: string | null = null;

    if (image) {
      const uploaded = await this.s3.uploadFiles([image]);
      imageId = uploaded.data.files[0].id;
    }

    return this.prisma.client.category.create({
      data: {
        title: dto.title,
        imageId: imageId ?? undefined,
      },
      include: {
        image: true,
      },
    });
  }

  async findAll() {
    return this.prisma.client.category.findMany({
      include: {
        image: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.client.category.findUnique({
      where: { id },
      include: {
        image: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(
    id: string,
    dto: UpdateCategoryDto,
    image?: Express.Multer.File,
  ) {
    await this.findOne(id);

    let newImageId: string | undefined;

    if (image) {
      const uploaded = await this.s3.uploadFiles([image]);
      newImageId = uploaded.data.files[0].id;
    }

    const updateData: {
      title?: string;
      imageId?: string;
    } = {};

    if (dto.title !== undefined) {
      updateData.title = dto.title;
    }

    if (newImageId !== undefined) {
      updateData.imageId = newImageId;
    }

    return this.prisma.client.category.update({
      where: { id },
      data: updateData,
      include: {
        image: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.client.category.delete({
      where: { id },
    });
  }
}
