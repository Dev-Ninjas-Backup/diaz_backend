import { HandleError } from '@/common/error/handle-error.decorator';
import { successResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { StripeService } from '@/lib/stripe/stripe.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/client';
import {
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
} from '../dto/subscription-plan.dto';

@Injectable()
export class SubscriptionPlanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
  ) {}

  @HandleError('Failed to create subscription plan', 'Subscription Plan')
  async createPlan(dto: CreateSubscriptionPlanDto) {
    const { product, stripePrice } = await this.stripe.createProductWithPrice({
      title: dto.title,
      description: dto.description || dto.title,
      price: dto.price,
      planType: dto.planType,
    });

    const plan = await this.prisma.client.subscriptionPlan.create({
      data: {
        title: dto.title,
        planType: dto.planType,
        description: dto.description,
        benefits: dto.benefits || [],
        picLimit: dto.picLimit ?? 5,
        wordLimit: dto.wordLimit ?? 500,
        isBest: dto.isBest ?? false,
        isActive: dto.isActive ?? true,
        price: dto.price,
        currency: dto.currency || 'usd',
        billingPeriodMonths: dto.billingPeriodMonths ?? 1,
        stripeProductId: product.id,
        stripePriceId: stripePrice.id,
      },
    });

    return successResponse(plan, 'Subscription plan created successfully');
  }

  @HandleError('Failed to update subscription plan', 'Subscription Plan')
  async updatePlan(id: string, dto: UpdateSubscriptionPlanDto) {
    await this.prisma.client.subscriptionPlan.findUniqueOrThrow({
      where: { id },
    });

    const updateData: Prisma.SubscriptionPlanUpdateInput = {};

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.benefits !== undefined) updateData.benefits = dto.benefits;
    if (dto.picLimit !== undefined) updateData.picLimit = dto.picLimit;
    if (dto.wordLimit !== undefined) updateData.wordLimit = dto.wordLimit;
    if (dto.isBest !== undefined) updateData.isBest = dto.isBest;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.currency !== undefined) updateData.currency = dto.currency;
    if (dto.billingPeriodMonths !== undefined)
      updateData.billingPeriodMonths = dto.billingPeriodMonths;

    const updatedPlan = await this.prisma.client.subscriptionPlan.update({
      where: { id },
      data: updateData,
    });

    return successResponse(
      updatedPlan,
      'Subscription plan updated successfully',
    );
  }

  @HandleError('Failed to delete subscription plan', 'Subscription Plan')
  async deletePlan(id: string) {
    await this.prisma.client.subscriptionPlan.findUniqueOrThrow({
      where: { id },
    });

    await this.prisma.client.subscriptionPlan.delete({
      where: { id },
    });

    return successResponse(null, 'Subscription plan deleted successfully');
  }

  @HandleError('Failed to get subscription plan', 'Subscription Plan')
  async getPlanById(id: string) {
    const plan = await this.prisma.client.subscriptionPlan.findUniqueOrThrow({
      where: { id },
    });

    return successResponse(plan, 'Subscription plan fetched successfully');
  }
}
