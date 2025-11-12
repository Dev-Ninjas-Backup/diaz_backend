import { AppError } from '@/common/error/handle-error.app';
import { HandleError } from '@/common/error/handle-error.decorator';
import {
  successPaginatedResponse,
  successResponse,
  TPaginatedResponse,
  TResponse,
} from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { GetCustomBoatsService } from '@/main/shared/boats/services/get-custom-boats.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { GetOwnBoatsDto } from '../dto/get-own-boats.dto';

@Injectable()
export class BoatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly getCustomBoatsService: GetCustomBoatsService,
  ) {}

  @HandleError('Failed to get boats')
  async getOwnBoats(
    userId: string,
    query: GetOwnBoatsDto,
  ): Promise<TPaginatedResponse<any>> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.BoatsWhereInput = {
      userId,
    };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    const [total, boats] = await this.prisma.$transaction([
      this.prisma.boats.count({ where }),
      this.prisma.boats.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
          engines: true,
          images: { include: { file: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const formattedBoats = boats.map((b) =>
      this.getCustomBoatsService.formatBoat(b),
    );

    return successPaginatedResponse(
      formattedBoats,
      { page, limit, total },
      'Boats found successfully',
    );
  }

  @HandleError('Failed to get boat')
  async getSingleBoat(userId: string, boatId: string): Promise<TResponse<any>> {
    const boat = await this.getCustomBoatsService.getSingleBoat(boatId);

    if (boat?.data?.userId !== userId) {
      throw new AppError(HttpStatus.FORBIDDEN, 'Boat not found');
    }

    return successResponse(boat.data, 'Boat found successfully');
  }

  @HandleError('Failed to get subscription confirmation', 'Onboarding')
  async getSubscriptionConfirmation(userId: string) {
    // Fetch the latest subscription for this user
    const subscription = await this.prisma.userSubscription.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        plan: true,
        user: { select: { id: true, email: true, name: true } },
      },
    });

    if (!subscription) {
      throw new AppError(
        HttpStatus.NOT_FOUND,
        'No subscription found for this user',
      );
    }

    // Compute if subscription is active
    const isActive = subscription.status === 'ACTIVE';

    // Fetch associated boat listings (if any)
    const listing = await this.prisma.boats.findFirst({
      where: { userId },
      select: {
        id: true,
        name: true,
        status: true,
      },
    });

    // Compose confirmation payload
    const result = {
      user: {
        id: subscription.user.id,
        name: subscription.user.name,
        email: subscription.user.email,
      },
      subscription: {
        id: subscription.id,
        planTitle: subscription.plan.title,
        status: subscription.status,
        startedAt: subscription.planStartedAt,
        endsAt: subscription.planEndedAt,
      },
      listing: listing
        ? {
            id: listing.id,
            name: listing.name,
            status: listing.status,
          }
        : null,
      message: isActive
        ? 'Your subscription is active. Welcome aboard!'
        : 'Your subscription is still pending. Please wait for confirmation.',
    };

    // Return final response
    return successResponse(
      result,
      'Subscription confirmation fetched successfully',
    );
  }
}
