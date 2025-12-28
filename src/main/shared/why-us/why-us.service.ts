import { TResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { S3Service } from '@/lib/s3/s3.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SiteType } from 'generated/client';
import { CreateWhyUsDto } from './dto/create-why-us.dto';
import { UpdateWhyUsDto } from './dto/update-why-us.dto';

@Injectable()
export class WhyUsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  async create(
    dto: CreateWhyUsDto,
    files?: {
      image1?: Express.Multer.File[];
      image2?: Express.Multer.File[];
      image3?: Express.Multer.File[];
    },
  ): Promise<TResponse<any>> {
    const existing = await this.prisma.client.whyUs.findFirst({
      where: { site: dto.site },
    });

    if (existing) {
      throw new ConflictException(
        `Why Us section already exists for ${dto.site} site. Use update endpoint instead.`,
      );
    }

    // Upload images if provided
    let image1Id: string | undefined;
    let image2Id: string | undefined;
    let image3Id: string | undefined;

    if (files?.image1?.[0]) {
      const uploadResult = await this.s3.uploadFiles([files.image1[0]]);
      if (!uploadResult.success) {
        throw new BadRequestException('Failed to upload image1');
      }
      image1Id = uploadResult.data.files[0].id;
    }

    if (files?.image2?.[0]) {
      const uploadResult = await this.s3.uploadFiles([files.image2[0]]);
      if (!uploadResult.success) {
        throw new BadRequestException('Failed to upload image2');
      }
      image2Id = uploadResult.data.files[0].id;
    }

    if (files?.image3?.[0]) {
      const uploadResult = await this.s3.uploadFiles([files.image3[0]]);
      if (!uploadResult.success) {
        throw new BadRequestException('Failed to upload image3');
      }
      image3Id = uploadResult.data.files[0].id;
    }

    const whyUs = await this.prisma.client.whyUs.create({
      data: {
        site: dto.site,
        title: dto.title,
        description: dto.description,
        excellence: dto.excellence,
        boatsSoldPerYear: dto.boatsSoldPerYear,
        listingViewed: dto.listingViewed,
        buttonText: dto.buttonText,
        buttonLink: dto.buttonLink,
        image1Id,
        image2Id,
        image3Id,
      },
      include: {
        image1: true,
        image2: true,
        image3: true,
      },
    });

    return {
      success: true,
      message: 'Why Us section created successfully',
      data: whyUs,
    };
  }

  async getWhyUs(site?: SiteType): Promise<TResponse<any>> {
    const siteType = site || SiteType.FLORIDA;

    const whyUs = await this.prisma.client.whyUs.findFirst({
      where: { site: siteType },
      include: {
        image1: true,
        image2: true,
        image3: true,
      },
    });

    if (!whyUs) {
      throw new NotFoundException(
        `Why Us section not found for ${siteType} site`,
      );
    }

    return {
      success: true,
      message: 'Why Us section retrieved successfully',
      data: whyUs,
    };
  }

  async update(
    site: SiteType,
    dto: UpdateWhyUsDto,
    files?: {
      image1?: Express.Multer.File[];
      image2?: Express.Multer.File[];
      image3?: Express.Multer.File[];
    },
  ): Promise<TResponse<any>> {
    const existing = await this.prisma.client.whyUs.findFirst({
      where: { site },
    });

    if (!existing) {
      throw new NotFoundException(`Why Us section not found for ${site} site`);
    }

    const updateData: any = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.excellence !== undefined) updateData.excellence = dto.excellence;
    if (dto.boatsSoldPerYear !== undefined)
      updateData.boatsSoldPerYear = dto.boatsSoldPerYear;
    if (dto.listingViewed !== undefined)
      updateData.listingViewed = dto.listingViewed;
    if (dto.buttonText !== undefined) updateData.buttonText = dto.buttonText;
    if (dto.buttonLink !== undefined) updateData.buttonLink = dto.buttonLink;

    // Upload new images if provided
    if (files?.image1?.[0]) {
      const uploadResult = await this.s3.uploadFiles([files.image1[0]]);
      if (!uploadResult.success) {
        throw new BadRequestException('Failed to upload image1');
      }
      updateData.image1Id = uploadResult.data.files[0].id;
    }

    if (files?.image2?.[0]) {
      const uploadResult = await this.s3.uploadFiles([files.image2[0]]);
      if (!uploadResult.success) {
        throw new BadRequestException('Failed to upload image2');
      }
      updateData.image2Id = uploadResult.data.files[0].id;
    }

    if (files?.image3?.[0]) {
      const uploadResult = await this.s3.uploadFiles([files.image3[0]]);
      if (!uploadResult.success) {
        throw new BadRequestException('Failed to upload image3');
      }
      updateData.image3Id = uploadResult.data.files[0].id;
    }

    const whyUs = await this.prisma.client.whyUs.update({
      where: { id: existing.id },
      data: updateData,
      include: {
        image1: true,
        image2: true,
        image3: true,
      },
    });

    return {
      success: true,
      message: 'Why Us section updated successfully',
      data: whyUs,
    };
  }

  async delete(site: SiteType): Promise<TResponse<any>> {
    const existing = await this.prisma.client.whyUs.findFirst({
      where: { site },
    });

    if (!existing) {
      throw new NotFoundException(`Why Us section not found for ${site} site`);
    }

    await this.prisma.client.whyUs.delete({
      where: { id: existing.id },
    });

    return {
      success: true,
      message: 'Why Us section deleted successfully',
      data: null,
    };
  }
}
