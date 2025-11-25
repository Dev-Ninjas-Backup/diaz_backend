import { HandleError } from '@/common/error/handle-error.decorator';
import {
  autoCompleteResponse,
  TAutoCompleteResponse,
} from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { BoatFeatureType, Prisma } from 'generated/client';
import { GetBoatFeaturesDto } from '../dto/get-boat-features.dto';

@Injectable()
export class BoatsFeatureService {
  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to fetch boat features')
  async getFeaturesByType(
    params: GetBoatFeaturesDto,
  ): Promise<TAutoCompleteResponse<BoatFeatureType>> {
    const { type, search, limit = 20 } = params;

    const where: Prisma.BoatFeatureWhereInput = {
      type,
      isDeleted: false,
    };

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const [total, items] = await this.prisma.client.$transaction([
      this.prisma.client.boatFeature.count({ where }),
      this.prisma.client.boatFeature.findMany({
        where,
        orderBy: { name: 'asc' },
        take: limit,
        select: { name: true },
      }),
    ]);

    const names = items.map((i) => i.name);

    return autoCompleteResponse(
      type,
      total,
      names,
      `Successfully fetched ${type} features ${search ? `for "${search}"` : ''}`,
    );
  }
}
