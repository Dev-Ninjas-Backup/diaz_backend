import { AppError } from '@/common/error/handle-error.app';
import { HandleError } from '@/common/error/handle-error.decorator';
import { successResponse, TResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { StripeService } from '@/lib/stripe/stripe.service';
import { PaymentMetadata } from '@/lib/stripe/stripe.types';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CreateIntentService {
  private readonly logger = new Logger(CreateIntentService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly stripeService: StripeService,
  ) {}

  @HandleError('Failed to create setup intent', 'Subscription')
  async createSetupIntent(
    userId: string,
    planId: string,
  ): Promise<TResponse<any>> {
    // 0. Normalize current time
    const now = new Date();

    // 1. Get user
    const user = await this.prismaService.client.user.findUniqueOrThrow({
      where: { id: userId },
    });

    // 2. Prevent creating intent if user already has an active subscription
    //    Active means status === 'ACTIVE' and ends in the future
    const activeSub =
      await this.prismaService.client.userSubscription.findFirst({
        where: {
          userId: user.id,
          status: 'ACTIVE',
          planEndedAt: { gt: now },
        },
      });
    if (activeSub) {
      // Optionally include plan info in error message
      throw new AppError(
        400,
        `User already has an active subscription until ${activeSub?.planEndedAt?.toISOString()}`,
      );
    }

    // 3. Get plan (must be active)
    const plan =
      await this.prismaService.client.subscriptionPlan.findUniqueOrThrow({
        where: { id: planId, isActive: true },
      });

    // 4. Prevent duplicate pending/incomplete intents
    //    If user already has a pending/incomplete payment intent for same plan,
    //    return that intent's client_secret if possible (so caller can reuse).
    const existingPending =
      await this.prismaService.client.userSubscription.findFirst({
        where: {
          userId: user.id,
          planId: plan.id,
          status: 'PENDING',
        },
        orderBy: { createdAt: 'desc' },
      });

    if (existingPending) {
      this.logger.log(
        `User ${user.id} already has a pending payment (${existingPending.stripeTransactionId}).`,
      );

      // Try to fetch the PaymentIntent to return client_secret (optional)
      try {
        const existingIntent = await this.stripeService.retrieveSetupIntent(
          existingPending.stripeTransactionId,
        );

        // If client_secret still available, return it instead of creating a new one
        if (existingIntent?.client_secret) {
          return successResponse(
            {
              setupIntentId: existingIntent.id,
              setupIntentSecret: existingIntent.client_secret,
              amount: plan.price,
              currency: plan.currency,
              planTitle: plan.title,
              message:
                'A pending payment already exists for this plan. Use the returned clientSecret to complete it.',
            },
            'Pending payment found',
          );
        }
      } catch (err) {
        // retrieving failed: fall through and create a new intent
        this.logger.warn(
          `Failed to retrieve existing PaymentIntent ${existingPending.stripeTransactionId}: ${err?.message}`,
        );
      }
    }

    // 5. Create metadata and payment intent
    const metadata: PaymentMetadata = {
      type: 'subscription',
      userId: user.id,
      email: user.email,
      name: user.name || user.username,
      planId: plan.id,
      planTitle: plan.title,
      priceCents: plan.price * 100,
      stripeProductId: plan.stripeProductId,
      stripePriceId: plan.stripePriceId,
    };

    const setupIntent = await this.stripeService.createSetupIntent(metadata);

    // 7. Record in DB with initial status = INCOMPLETE (waiting for webhook confirmation)
    await this.prismaService.client.userSubscription.create({
      data: {
        user: { connect: { id: user.id } },
        plan: { connect: { id: plan.id } },
        planStartedAt: now,
        stripeTransactionId: setupIntent.id,
        status: 'PENDING',
      },
    });

    this.logger.log(
      `Created setup intent ${setupIntent.id} for user ${user.email}`,
    );

    // 8. Return client_secret to caller
    return successResponse(
      {
        setupIntentId: setupIntent.id,
        setupIntentSecret: setupIntent.client_secret,
        amount: plan.price,
        currency: plan.currency,
        planTitle: plan.title,
      },
      'Created setup intent to connect payment method',
    );
  }
}
