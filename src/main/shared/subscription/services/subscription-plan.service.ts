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
    if (dto.planType !== undefined) updateData.planType = dto.planType;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.benefits !== undefined) updateData.benefits = dto.benefits;
    if (dto.picLimit !== undefined) updateData.picLimit = dto.picLimit;
    if (dto.wordLimit !== undefined) updateData.wordLimit = dto.wordLimit;
    if (dto.isBest !== undefined) updateData.isBest = dto.isBest;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.price !== undefined) updateData.price = dto.price;
    if (dto.currency !== undefined) updateData.currency = dto.currency;
    if (dto.billingPeriodMonths !== undefined)
      updateData.billingPeriodMonths = dto.billingPeriodMonths;
    if (dto.stripeProductId !== undefined)
      updateData.stripeProductId = dto.stripeProductId;
    if (dto.stripePriceId !== undefined)
      updateData.stripePriceId = dto.stripePriceId;

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

  @HandleError(
    'Failed to sync subscription plans with Stripe',
    'Subscription Plan',
  )
  async syncPlansWithStripe() {
    const plans = await this.prisma.client.subscriptionPlan.findMany();
    const results: { plan: string; action: string; stripePriceId: string }[] =
      [];

    for (const plan of plans) {
      // Try to find an existing active price in Stripe by lookup key
      const existingPrice = await this.stripe.getActivePriceByPlanType(
        plan.planType,
      );

      if (existingPrice) {
        // Update DB with the real Stripe IDs from this account
        const productId =
          typeof existingPrice.product === 'string'
            ? existingPrice.product
            : existingPrice.product.id;

        await this.prisma.client.subscriptionPlan.update({
          where: { id: plan.id },
          data: {
            stripePriceId: existingPrice.id,
            stripeProductId: productId,
          },
        });

        results.push({
          plan: plan.title,
          action: 'updated',
          stripePriceId: existingPrice.id,
        });
      } else {
        // No price found with the lookup key — create product + price in Stripe
        const { product, stripePrice } =
          await this.stripe.createProductWithPrice({
            title: plan.title,
            description: plan.description || plan.title,
            price: plan.price,
            planType: plan.planType,
          });

        await this.prisma.client.subscriptionPlan.update({
          where: { id: plan.id },
          data: {
            stripePriceId: stripePrice.id,
            stripeProductId: product.id,
          },
        });

        results.push({
          plan: plan.title,
          action: 'created',
          stripePriceId: stripePrice.id,
        });
      }
    }

    return successResponse(
      results,
      'Subscription plans synced with Stripe successfully',
    );
  }
}
