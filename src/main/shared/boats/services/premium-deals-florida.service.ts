import { PaginationDto } from '@/common/dto/pagination.dto';
import { HandleError } from '@/common/error/handle-error.decorator';
import {
  successPaginatedResponse,
  TPaginatedResponse,
} from '@/common/utils/response.util';
import { GetAllCustomBoatsService } from '@/lib/boatsgroup/services/get-all-custom-boats.service';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/client';

@Injectable()
export class PremiumDealsFloridaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly getAllCustomBoatsService: GetAllCustomBoatsService,
  ) {}

  @HandleError('Failed to get premium deals near Florida', 'Boats')
  async getPremiumDealsNearFlorida(
    options?: PaginationDto,
  ): Promise<TPaginatedResponse<any>> {
    const page = Math.max(Number(options?.page) || 1, 1);
    const requestedLimit = Number(options?.limit);
    const DEFAULT_LIMIT = 10;
    const MAX_LIMIT = 100;
    const limit = Math.min(
      Math.max(
        Number.isFinite(requestedLimit) && requestedLimit > 0
          ? requestedLimit
          : DEFAULT_LIMIT,
        1,
      ),
      MAX_LIMIT,
    );
    const skip = (page - 1) * limit;

    const where: Prisma.BoatsWhereInput = {
      AND: [
        { status: 'ACTIVE' },
        { state: { equals: 'Florida', mode: 'insensitive' } },
        {
          user: {
            currentPlanId: { not: null },
            currentPlan: {
              planType: {
                in: ['DIAMOND', 'PLATINUM'],
              },
            },
            currentPlanStatus: 'ACTIVE',
          },
        },
      ],
    };

    const [total, boats] = await this.prisma.client.$transaction([
      this.prisma.client.boats.count({ where }),
      this.prisma.client.boats.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatarUrl: true,
            },
          },
          engines: true,
          images: { include: { file: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const formattedBoats = boats.map((b) =>
      this.getAllCustomBoatsService.transformBoat(b),
    );

    return successPaginatedResponse(
      formattedBoats,
      { page, limit, total },
      'Premium deals near Florida found successfully',
    );
  }
}
