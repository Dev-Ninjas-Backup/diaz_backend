import { HandleError } from '@/common/error/handle-error.decorator';
import {
  successPaginatedResponse,
  successResponse,
} from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/client';
import { PromoCodeQueryDto } from '../dto/promo-code-query.dto';
import { CreatePromoCodeDto, UpdatePromoCodeDto } from '../dto/promo-code.dto';

@Injectable()
export class AdminPromoCodeService {
  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to fetch promo codes', 'Promo Code')
  async getAllPromoCodes(query: PromoCodeQueryDto) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.PromoCodeWhereInput = {};

    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { stripeCouponId: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [promos, total] = await this.prisma.client.$transaction([
      this.prisma.client.promoCode.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { usedBy: true },
          },
        },
        skip,
        take: limit,
      }),
      this.prisma.client.promoCode.count({ where }),
    ]);

    return successPaginatedResponse(
      promos,
      { page, limit, total },
      'Promo codes fetched successfully',
    );
  }

  @HandleError('Failed to get promo code', 'Promo Code')
  async getPromoCodeById(id: string) {
    const promo = await this.prisma.client.promoCode.findUniqueOrThrow({
      where: { id },
    });

    return successResponse(promo, 'Promo code fetched successfully');
  }

  @HandleError('Failed to create promo code', 'Promo Code')
  async createPromoCode(dto: CreatePromoCodeDto) {
    const promo = await this.prisma.client.promoCode.create({
      data: {
        ...dto,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });

    return successResponse(promo, 'Promo code created successfully');
  }

  @HandleError('Failed to update promo code', 'Promo Code')
  async updatePromoCode(id: string, dto: UpdatePromoCodeDto) {
    await this.prisma.client.promoCode.findUniqueOrThrow({
      where: { id },
    });

    const updateData: Prisma.PromoCodeUpdateInput = { ...dto };
    if (dto.expiresAt) {
      updateData.expiresAt = new Date(dto.expiresAt);
    }

    const updatedPromo = await this.prisma.client.promoCode.update({
      where: { id },
      data: updateData,
    });

    return successResponse(updatedPromo, 'Promo code updated successfully');
  }

  @HandleError('Failed to delete promo code', 'Promo Code')
  async deletePromoCode(id: string) {
    await this.prisma.client.promoCode.findUniqueOrThrow({
      where: { id },
    });

    await this.prisma.client.promoCode.delete({
      where: { id },
    });

    return successResponse(null, 'Promo code deleted successfully');
  }
}
