import { HandleError } from '@/common/error/handle-error.decorator';
import { successResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/client';
import { CreatePromoCodeDto, UpdatePromoCodeDto } from '../dto/promo-code.dto';

@Injectable()
export class AdminPromoCodeService {
  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to fetch promo codes', 'AdminSubscription')
  async getAllPromoCodes() {
    const promos = await this.prisma.client.promoCode.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { usedBy: true },
        },
      },
    });

    return successResponse(promos, 'Promo codes fetched successfully');
  }

  @HandleError('Failed to get promo code', 'AdminSubscription')
  async getPromoCodeById(id: string) {
    const promo = await this.prisma.client.promoCode.findUniqueOrThrow({
      where: { id },
    });

    return successResponse(promo, 'Promo code fetched successfully');
  }

  @HandleError('Failed to create promo code', 'AdminSubscription')
  async createPromoCode(dto: CreatePromoCodeDto) {
    const promo = await this.prisma.client.promoCode.create({
      data: {
        ...dto,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });

    return successResponse(promo, 'Promo code created successfully');
  }

  @HandleError('Failed to update promo code', 'AdminSubscription')
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

  @HandleError('Failed to delete promo code', 'AdminSubscription')
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
