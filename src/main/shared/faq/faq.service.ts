import { TResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SiteType } from 'generated/client';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Injectable()
export class FaqService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFaqDto): Promise<TResponse<any>> {
    // Check if FAQ already exists for this site
    const existing = await this.prisma.client.fAQ.findFirst({
      where: { site: dto.site },
    });

    if (existing) {
      throw new ConflictException(
        `FAQ already exists for ${dto.site} site. Use update endpoint instead.`,
      );
    }

    const faq = await this.prisma.client.fAQ.create({
      data: {
        site: dto.site,
        title: dto.title,
        subtitle: dto.subtitle,
        questions: dto.questions as any,
      },
    });

    return {
      success: true,
      message: 'FAQ created successfully',
      data: faq,
    };
  }

  async getFaq(site?: SiteType): Promise<TResponse<any>> {
    const siteType = site || SiteType.FLORIDA;

    const faq = await this.prisma.client.fAQ.findFirst({
      where: { site: siteType },
    });

    if (!faq) {
      throw new NotFoundException(`FAQ not found for ${siteType} site`);
    }

    return {
      success: true,
      message: 'FAQ retrieved successfully',
      data: faq,
    };
  }

  async update(site: SiteType, dto: UpdateFaqDto): Promise<TResponse<any>> {
    const existing = await this.prisma.client.fAQ.findFirst({
      where: { site },
    });

    if (!existing) {
      throw new NotFoundException(`FAQ not found for ${site} site`);
    }

    const updateData: any = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.subtitle !== undefined) updateData.subtitle = dto.subtitle;
    if (dto.questions !== undefined) updateData.questions = dto.questions;

    const faq = await this.prisma.client.fAQ.update({
      where: { id: existing.id },
      data: updateData,
    });

    return {
      success: true,
      message: 'FAQ updated successfully',
      data: faq,
    };
  }

  async delete(site: SiteType): Promise<TResponse<any>> {
    const existing = await this.prisma.client.fAQ.findFirst({
      where: { site },
    });

    if (!existing) {
      throw new NotFoundException(`FAQ not found for ${site} site`);
    }

    await this.prisma.client.fAQ.delete({
      where: { id: existing.id },
    });

    return {
      success: true,
      message: 'FAQ deleted successfully',
      data: null,
    };
  }
}
