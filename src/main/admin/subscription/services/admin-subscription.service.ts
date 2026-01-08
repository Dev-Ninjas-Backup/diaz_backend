import { PaginationDto } from '@/common/dto/pagination.dto';
import { HandleError } from '@/common/error/handle-error.decorator';
import {
  successPaginatedResponse,
  successResponse,
} from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/client';
import { SubscriptionQueryDto } from '../dto/subscription-query.dto';

@Injectable()
export class AdminSubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to fetch subscriptions')
  async getAllSubscriptions(query: SubscriptionQueryDto) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const { status, userId, search } = query;

    const where: Prisma.UserSubscriptionWhereInput = {};

    if (status) {
      where.status = status;
    }
    if (userId) {
      where.userId = userId;
    }
    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { stripeSubscriptionId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [subscriptions, total] = await this.prisma.client.$transaction([
      this.prisma.client.userSubscription.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatarUrl: true,
            },
          },
          plan: true,
          promoCode: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.client.userSubscription.count({ where }),
    ]);

    return successPaginatedResponse(
      subscriptions,
      { total, page, limit },
      'Subscriptions fetched successfully',
    );
  }

  @HandleError('Failed to get subscription details')
  async getSubscriptionById(id: string) {
    const subscription =
      await this.prisma.client.userSubscription.findUniqueOrThrow({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatarUrl: true,
            },
          },
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

  @HandleError('Failed to fetch subscription plans')
  async getAllPlans(query: PaginationDto) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const [plans, total] = await this.prisma.client.$transaction([
      this.prisma.client.subscriptionPlan.findMany({
        orderBy: { price: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.client.subscriptionPlan.count(),
    ]);

    return successPaginatedResponse(
      plans,
      { total, page, limit },
      'Subscription plans fetched successfully',
    );
  }
}
