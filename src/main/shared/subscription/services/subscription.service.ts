import { HandleError } from '@/common/error/handle-error.decorator';
import { successResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ValidatePromoCodeDto } from '../dto/validate-promo.dto';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to fetch all boat plans', 'Subscription')
  async getAllPlans() {
    const plans = await this.prisma.client.subscriptionPlan.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(plans, 'Fetched all boat plans successfully');
  }

  @HandleError('Failed to validate promo code', 'Subscription')
  async validatePromoCode(dto: ValidatePromoCodeDto) {
    const code = dto.code.trim();

    const promo = await this.prisma.client.promoCode.findFirst({
      where: {
        code: {
          equals: code,
          mode: 'insensitive',
        },
      },
      include: {
        _count: {
          select: { usedBy: true },
        },
      },
    });

    if (!promo) {
      return successResponse(
        {
          code,
          isValid: false,
          reason: 'NOT_FOUND' as const,
        },
        'Promo code is invalid',
      );
    }

    const now = new Date();

    if (promo.expiresAt && promo.expiresAt < now) {
      return successResponse(
        {
          code: promo.code,
          isValid: false,
          reason: 'EXPIRED' as const,
        },
        'Promo code has expired',
      );
    }

    const usedCount = promo._count?.usedBy ?? 0;

    if (
      promo.maxRedemptions !== null &&
      promo.maxRedemptions !== undefined &&
      usedCount >= promo.maxRedemptions
    ) {
      return successResponse(
        {
          code: promo.code,
          isValid: false,
          reason: 'MAX_REDEMPTIONS_REACHED' as const,
          usedCount,
          maxRedemptions: promo.maxRedemptions,
        },
        'Promo code usage limit reached',
      );
    }

    return successResponse(
      {
        code: promo.code,
        isValid: true,
        freeDays: promo.freeDays,
        expiresAt: promo.expiresAt,
        maxRedemptions: promo.maxRedemptions,
        usedCount,
        remainingRedemptions:
          promo.maxRedemptions !== null && promo.maxRedemptions !== undefined
            ? Math.max(promo.maxRedemptions - usedCount, 0)
            : null,
      },
      'Promo code is valid',
    );
  }
}
