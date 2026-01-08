import { HandleError } from '@/common/error/handle-error.decorator';
import { successResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminSubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to fetch subscriptions', 'AdminSubscription')
  async getAllSubscriptions(query: { status?: any; userId?: string } = {}) {
    const { status, userId } = query;
    const subscriptions = await this.prisma.client.userSubscription.findMany({
      where: {
        ...(status && { status }),
        ...(userId && { userId }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        plan: true,
        promoCode: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(subscriptions, 'Subscriptions fetched successfully');
  }

  @HandleError('Failed to get subscription details', 'AdminSubscription')
  async getSubscriptionById(id: string) {
    const subscription =
      await this.prisma.client.userSubscription.findUniqueOrThrow({
        where: { id },
        include: {
          user: true,
          plan: true,
          promoCode: true,
          Invoice: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

    return successResponse(
      subscription,
      'Subscription details fetched successfully',
    );
  }

  @HandleError('Failed to fetch subscription plans', 'AdminSubscription')
  async getAllPlans() {
    const plans = await this.prisma.client.subscriptionPlan.findMany({
      orderBy: { price: 'asc' },
    });

    return successResponse(plans, 'Subscription plans fetched successfully');
  }
}
