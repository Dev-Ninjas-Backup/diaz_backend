import { HandleError } from '@/common/error/handle-error.decorator';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { GetBoatFeaturesDto } from './get-boat-features.dto';

@Injectable()
export class BoatsFeatureService {
  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to fetch boat features')
  async getFeaturesByType(params: GetBoatFeaturesDto) {
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

    const items = await this.prisma.boatFeature.findMany({
      where,
      orderBy: { name: 'asc' },
      take: limit,
      select: { name: true },
    });

    const names = items.map((i) => i.name);

    return {
      success: true,
      message: `Successfully fetched ${type} features`,
      type,
      count: names.length,
      items: names,
    };
  }
}
