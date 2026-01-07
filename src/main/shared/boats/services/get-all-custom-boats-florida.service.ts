import { HandleError } from '@/common/error/handle-error.decorator';
import {
  successPaginatedResponse,
  TPaginatedResponse,
} from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/client';
import { GetAllBoatsCustomDto } from '../dto/get-all-boats-custom.dto';

import { GetAllCustomBoatsService } from '@/lib/boatsgroup/services/get-all-custom-boats.service';

@Injectable()
export class GetAllCustomBoatsFloridaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly getAllCustomBoatsService: GetAllCustomBoatsService,
  ) {}

  @HandleError('Failed to get boats', 'Boats')
  async getAllBoats(
    options?: GetAllBoatsCustomDto,
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

    // Build where clause only with provided filters
    const and: any[] = [];

    // Text fields (case-insensitive contains)
    if (options?.make) {
      and.push({ make: { contains: options.make, mode: 'insensitive' } });
    }

    if (options?.model) {
      and.push({ model: { contains: options.model, mode: 'insensitive' } });
    }
    if (options?.class) {
      and.push({ class: { contains: options.class, mode: 'insensitive' } });
    }
    // Build year exact or range
    if (
      typeof options?.buildYear === 'number' &&
      Number.isFinite(options.buildYear)
    ) {
      and.push({ buildYear: options.buildYear });
    } else if (
      typeof options?.buildYearStart === 'number' ||
      typeof options?.buildYearEnd === 'number'
    ) {
      const buildYearFilter: any = {};
      if (
        typeof options.buildYearStart === 'number' &&
        Number.isFinite(options.buildYearStart)
      ) {
        buildYearFilter.gte = options.buildYearStart;
      }
      if (
        typeof options.buildYearEnd === 'number' &&
        Number.isFinite(options.buildYearEnd)
      ) {
        buildYearFilter.lte = options.buildYearEnd;
      }
      and.push({ buildYear: buildYearFilter });
    }

    // Price range
    if (
      typeof options?.priceStart === 'number' ||
      typeof options?.priceEnd === 'number'
    ) {
      const priceFilter: any = {};
      if (
        typeof options.priceStart === 'number' &&
        Number.isFinite(options.priceStart)
      ) {
        priceFilter.gte = options.priceStart;
      }
      if (
        typeof options.priceEnd === 'number' &&
        Number.isFinite(options.priceEnd)
      ) {
        priceFilter.lte = options.priceEnd;
      }
      and.push({ price: priceFilter });
    }

    // Length range
    if (
      typeof options?.lengthStart === 'number' ||
      typeof options?.lengthEnd === 'number'
    ) {
      const lengthFilter: any = {};
      if (
        typeof options.lengthStart === 'number' &&
        Number.isFinite(options.lengthStart)
      ) {
        lengthFilter.gte = options.lengthStart;
      }
      if (
        typeof options.lengthEnd === 'number' &&
        Number.isFinite(options.lengthEnd)
      ) {
        lengthFilter.lte = options.lengthEnd;
      }
      and.push({ length: lengthFilter });
    }

    // Beam range
    if (
      typeof options?.beamSizeStart === 'number' ||
      typeof options?.beamSizeEnd === 'number'
    ) {
      const beamFilter: any = {};
      if (
        typeof options.beamSizeStart === 'number' &&
        Number.isFinite(options.beamSizeStart)
      ) {
        beamFilter.gte = options.beamSizeStart;
      }
      if (
        typeof options.beamSizeEnd === 'number' &&
        Number.isFinite(options.beamSizeEnd)
      ) {
        beamFilter.lte = options.beamSizeEnd;
      }
      and.push({ beam: beamFilter });
    }

    // Exact integer matches
    if (
      typeof options?.enginesNumber === 'number' &&
      Number.isFinite(options.enginesNumber)
    ) {
      and.push({ enginesNumber: options.enginesNumber });
    }
    if (
      typeof options?.headsNumber === 'number' &&
      Number.isFinite(options.headsNumber)
    ) {
      and.push({ headsNumber: options.headsNumber });
    }
    if (
      typeof options?.cabinsNumber === 'number' &&
      Number.isFinite(options.cabinsNumber)
    ) {
      and.push({ cabinsNumber: options.cabinsNumber });
    }

    // Location search (city or state)
    if (options?.location) {
      and.push({
        OR: [
          { city: { contains: options.location, mode: 'insensitive' } },
          { state: { contains: options.location, mode: 'insensitive' } },
        ],
      });
    }

    // Default: only active listings
    and.push({ status: 'ACTIVE' });

    const where: Prisma.BoatsWhereInput = and.length > 0 ? { AND: and } : {};

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
      'Boats found successfully',
    );
  }
}
