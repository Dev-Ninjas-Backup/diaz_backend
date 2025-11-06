import { HandleError } from '@/common/error/handle-error.decorator';
import { successResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to fetch all boat plans', 'Subscription')
  async getAllPlans() {
    const plans = await this.prisma.subscriptionPlan.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(plans, 'Fetched all boat plans successfully');
  }
}
