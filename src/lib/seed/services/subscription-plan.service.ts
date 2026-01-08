import { PrismaService } from '@/lib/prisma/prisma.service';
import {
  couponSeedData,
  freeCouponSeedData,
  planSeedData,
} from '@/lib/seed/data/stripe.data';
import { StripeService } from '@/lib/stripe/stripe.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

@Injectable()
export class SubscriptionPlanService implements OnModuleInit {
  private readonly logger = new Logger(SubscriptionPlanService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
  ) {}

  async onModuleInit() {
    // seed plans
    await this.seedPlans();
    // wait for 5 seconds before seeding coupons
    await new Promise((resolve) => setTimeout(resolve, 5000));
    // seed standard coupons
    await this.seedCoupons();
    // wait for 5 seconds before seeding free coupons
    await new Promise((resolve) => setTimeout(resolve, 5000));
    // seed global free coupons
    await this.seedFreeCoupons();
  }

  async seedPlans() {
    for (const plan of planSeedData) {
      const existingPlan = await this.prisma.client.subscriptionPlan.findFirst({
        where: { planType: plan.planType },
      });

      if (existingPlan) {
        this.logger.log(
          `[EXIST] ${plan.title} already exists in DB, skipping DB create...`,
        );
        continue;
      }

      // Check for existing Stripe price
      const existingPrice = await this.stripe.getActivePriceByPlanType(
        plan.planType,
      );

      if (existingPrice) {
        this.logger.log(
          `[REUSE] Reusing price ${existingPrice.id} for ${plan.planType}`,
        );

        await this.prisma.client.subscriptionPlan.create({
          data: {
            ...plan,
            stripeProductId: existingPrice.product as string,
            stripePriceId: existingPrice.id,
          },
        });

        this.logger.log(`[CREATED] DB Plan: ${plan.title}`);

        continue;
      }

      const { stripePrice } = await this.stripe.createProductWithPrice({
        title: plan.title,
        description: plan.description,
        price: plan.price,
        planType: plan.planType,
      });

      await this.prisma.client.subscriptionPlan.create({
        data: {
          ...plan,
          stripeProductId: stripePrice.product as string,
          stripePriceId: stripePrice.id,
        },
      });

      this.logger.log(`[CREATED] DB Plan: ${plan.title}`);
    }
  }

  async seedCoupons() {
    this.logger.log('Seeding standard coupons...');
    await this.processCouponSeeding(couponSeedData);
  }

  async seedFreeCoupons() {
    this.logger.log('Seeding global trial-based free coupons...');
    await this.processCouponSeeding(freeCouponSeedData);
  }

  private async processCouponSeeding(data: any[]) {
    for (const item of data) {
      // 1. Check if already exists
      const existing = await this.prisma.client.promoCode.findUnique({
        where: { code: item.code },
      });

      if (existing) {
        this.logger.log(`[EXIST] PromoCode ${item.code} already exists`);
        continue;
      }

      // 2. Create Promo in DB (No planId, no Stripe ID necessary if it's 100% free trial)
      await this.prisma.client.promoCode.create({
        data: {
          code: item.code,
          freeDays: item.freeDays,
        },
      });

      this.logger.log(`[CREATED] Global PromoCode: ${item.code}`);
    }
  }
}
