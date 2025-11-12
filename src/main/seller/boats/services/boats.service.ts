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
}
