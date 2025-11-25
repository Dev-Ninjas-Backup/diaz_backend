// src/main/shared/paywall/paywall-check.service.ts
import { AppError } from '@/common/error/handle-error.app';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PaywallCheckService {
  private readonly logger = new Logger(PaywallCheckService.name);

  constructor(private readonly prisma: PrismaService) {}

  async validateUserCanPost(userId: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(HttpStatus.NOT_FOUND, 'User not found');
    }

    if (!user.currentPlanId) {
      throw new AppError(
        HttpStatus.UNAUTHORIZED,
        'User is not subscribed to any plan',
      );
    }

    // Get active subscription
    const activeSub = await this.prisma.client.userSubscription.findFirst({
      where: { userId, status: 'ACTIVE' },
    });

    if (!activeSub) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        'No active subscription found',
      );
    }

    if (activeSub.planEndedAt && activeSub.planEndedAt < new Date()) {
      throw new AppError(HttpStatus.BAD_REQUEST, 'Subscription has expired');
    }

    // Check plan
    const plan = await this.prisma.client.subscriptionPlan.findUnique({
      where: { id: user.currentPlanId },
    });

    if (!plan) {
      throw new AppError(HttpStatus.BAD_REQUEST, 'Invalid subscription plan');
    }

    this.logger.debug(
      `Validated user ${userId} with plan ${plan.title} (ID: ${plan.id})`,
    );

    return {
      user,
      plan,
    };
  }
}
