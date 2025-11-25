import { AppError } from '@/common/error/handle-error.app';
import { HandleError } from '@/common/error/handle-error.decorator';
import { successResponse, TResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { StripeService } from '@/lib/stripe/stripe.service';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PaymentRetryService {
  private readonly logger = new Logger(PaymentRetryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
  ) {}

  /**
   * Re-request SetupIntent for users who failed to add card during onboarding
   * This allows users to retry payment method setup without going through onboarding again
   */
  @HandleError('Failed to create new setup intent', 'Payment')
  async retrySetupIntent(userId: string): Promise<TResponse<any>> {
    // Find the pending subscription for this user
    const pendingSubscription = await this.findPendingSubscription(userId);

    if (!pendingSubscription) {
      throw new AppError(
        HttpStatus.NOT_FOUND,
        'No pending subscription found for this user',
      );
    }

    // Get user and plan details
    const [user, plan] = await Promise.all([
      this.prisma.client.user.findUnique({ where: { id: userId } }),
      this.prisma.client.subscriptionPlan.findUnique({
        where: { id: pendingSubscription.planId },
      }),
    ]);

    if (!user) {
      throw new AppError(HttpStatus.NOT_FOUND, 'User not found');
    }

    if (!plan) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Subscription plan not found');
    }

    this.logger.log(
      `Retrying setup intent for user ${userId} with plan ${plan.title}`,
    );

    // Create a new SetupIntent
    const setupIntent = await this.stripe.createSetupIntent({
      type: 'onboarding_subscription',
      userId: user.id,
      email: user.email,
      name: user.name,
      planId: plan.id,
      planTitle: plan.title,
      priceCents: plan.price * 100,
      stripeProductId: plan.stripeProductId,
      stripePriceId: plan.stripePriceId,
    });

    // Update the pending subscription with new SetupIntent ID
    await this.prisma.client.userSubscription.update({
      where: { id: pendingSubscription.id },
      data: {
        stripeTransactionId: setupIntent.id,
        updatedAt: new Date(),
      },
    });

    this.logger.log(
      `Created new SetupIntent ${setupIntent.id} for user ${userId}`,
    );

    return successResponse(
      {
        setupIntentId: setupIntent.id,
        setupIntentClientSecret: setupIntent.client_secret,
        planTitle: plan.title,
        planPrice: plan.price,
      },
      'New setup intent created successfully',
    );
  }

  // Get current status of setup intent and subscription
  @HandleError('Failed to get payment status', 'Payment')
  async getPaymentStatus(userId: string): Promise<TResponse<any>> {
    const subscription = await this.prisma.client.userSubscription.findFirst({
      where: {
        userId,
        status: { in: ['PENDING', 'ACTIVE'] },
      },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    let setupIntentStatus: string | null = null;

    if (
      subscription?.status === 'PENDING' &&
      subscription.stripeTransactionId
    ) {
      try {
        const setupIntent = await this.stripe.retrieveSetupIntent(
          subscription.stripeTransactionId,
        );
        setupIntentStatus = setupIntent.status;
      } catch (error: any) {
        this.logger.error(`Failed to retrieve SetupIntent: ${error.message}`);
      }
    }

    return successResponse(
      {
        subscriptionId: subscription?.id || null,
        subscriptionStatus: subscription?.status || 'NONE',
        setupIntentId: subscription?.stripeTransactionId || null,
        setupIntentStatus,
        plan: subscription
          ? {
              id: subscription.plan.id,
              title: subscription.plan.title,
              price: subscription.plan.price,
            }
          : null,
        requiresPaymentMethod: subscription?.status === 'PENDING' || false,
      },
      'Payment status retrieved successfully',
    );
  }

  // Cancel a pending subscription if user decides not to proceed
  @HandleError('Failed to cancel pending subscription', 'Payment')
  async cancelPendingSubscription(userId: string): Promise<TResponse<any>> {
    const pendingSubscription = await this.findPendingSubscription(userId);

    if (!pendingSubscription) {
      throw new AppError(
        HttpStatus.NOT_FOUND,
        'No pending subscription found for this user',
      );
    }

    // Update subscription status to CANCELLED
    await this.prisma.client.userSubscription.update({
      where: { id: pendingSubscription.id },
      data: {
        status: 'CANCELED',
        planEndedAt: new Date(),
      },
    });

    this.logger.log(
      `Cancelled pending subscription ${pendingSubscription.id} for user ${userId}`,
    );

    return successResponse(null, 'Pending subscription cancelled successfully');
  }

  private async findPendingSubscription(userId: string) {
    return await this.prisma.client.userSubscription.findFirst({
      where: {
        userId,
        status: 'PENDING',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
