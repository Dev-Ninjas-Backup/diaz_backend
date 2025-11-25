import { AppError } from '@/common/error/handle-error.app';
import { HandleError } from '@/common/error/handle-error.decorator';
import { successResponse, TResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';

import { StripeService } from '@/lib/stripe/stripe.service';
import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from 'generated/client';

@Injectable()
export class CancelSubscriptionService {
  private readonly logger = new Logger(CancelSubscriptionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
  ) {}

  @HandleError('Failed to cancel subscription')
  async cancelCurrentSubscription(userId: string): Promise<TResponse<any>> {
    const subscription = await this.prisma.client.userSubscription.findFirst({
      where: { userId, status: 'ACTIVE' },
      orderBy: [
        { updatedAt: Prisma.SortOrder.desc },
        { createdAt: Prisma.SortOrder.desc },
      ],
    });

    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new AppError(400, 'No active subscription found');
    }

    const stripeSubscriptionId = subscription.stripeSubscriptionId;

    // Cancel Stripe subscription after the end of the current billing period
    await this.stripe.cancelSubscription(stripeSubscriptionId);

    // Update local DB subscription & user
    await this.prisma.client.$transaction([
      this.prisma.client.userSubscription.update({
        where: { id: subscription.id },
        data: {
          status: 'CANCELED',
          planEndedAt: new Date(),
        },
      }),
      this.prisma.client.user.update({
        where: { id: userId },
        data: {
          currentPlanStatus: 'CANCELED',
          currentPlan: undefined,
        },
      }),
    ]);

    this.logger.log(
      `Subscription ${stripeSubscriptionId} for user ${userId} cancelled immediately`,
    );

    return successResponse(null, 'Subscription cancelled successfully');
  }
}
