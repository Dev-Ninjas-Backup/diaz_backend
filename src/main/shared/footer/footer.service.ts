import { TResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SiteType } from 'generated/client';
import { CreateFooterDto } from './dto/create-footer.dto';
import { UpdateFooterDto } from './dto/update-footer.dto';

@Injectable()
export class FooterService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFooterDto): Promise<TResponse<any>> {
    const existing = await this.prisma.client.footerSettings.findFirst({
      where: { site: dto.site },
    });

    if (existing) {
      throw new ConflictException(
        `Footer already exists for ${dto.site} site. Use update endpoint instead.`,
      );
    }

    const footer = await this.prisma.client.footerSettings.create({
      data: {
        site: dto.site,
        companyName: dto.companyName,
        companyDescription: dto.companyDescription,
        quickLinks: dto.quickLinks as any,
        policyLinks: dto.policyLinks as any,
        phone: dto.phone,
        email: dto.email,
        socialMediaLinks: dto.socialMediaLinks as any,
        copyrightText: dto.copyrightText,
      },
    });

    return {
      success: true,
      message: 'Footer created successfully',
      data: footer,
    };
  }

  async getFooter(site?: SiteType): Promise<TResponse<any>> {
    const siteType = site || SiteType.FLORIDA;

    const footer = await this.prisma.client.footerSettings.findFirst({
      where: { site: siteType },
    });

    if (!footer) {
      throw new NotFoundException(`Footer not found for ${siteType} site`);
    }

    return {
      success: true,
      message: 'Footer retrieved successfully',
      data: footer,
    };
  }

  async update(site: SiteType, dto: UpdateFooterDto): Promise<TResponse<any>> {
    const existing = await this.prisma.client.footerSettings.findFirst({
      where: { site },
    });

    if (!existing) {
      throw new NotFoundException(`Footer not found for ${site} site`);
    }

    const updateData: any = {};
    if (dto.companyName !== undefined) updateData.companyName = dto.companyName;
    if (dto.companyDescription !== undefined)
      updateData.companyDescription = dto.companyDescription;
    if (dto.quickLinks !== undefined) updateData.quickLinks = dto.quickLinks;
    if (dto.policyLinks !== undefined) updateData.policyLinks = dto.policyLinks;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.socialMediaLinks !== undefined)
      updateData.socialMediaLinks = dto.socialMediaLinks;
    if (dto.copyrightText !== undefined)
      updateData.copyrightText = dto.copyrightText;

    const footer = await this.prisma.client.footerSettings.update({
      where: { id: existing.id },
      data: updateData,
    });

    return {
      success: true,
      message: 'Footer updated successfully',
      data: footer,
    };
  }

  async delete(site: SiteType): Promise<TResponse<any>> {
    const existing = await this.prisma.client.footerSettings.findFirst({
      where: { site },
    });

    if (!existing) {
      throw new NotFoundException(`Footer not found for ${site} site`);
    }

    await this.prisma.client.footerSettings.delete({
      where: { id: existing.id },
    });

    return {
      success: true,
      message: 'Footer deleted successfully',
      data: null,
    };
  }
}
