import { HandleError } from '@/common/error/handle-error.decorator';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { GetBoatSpecificationsDto } from '../dto/get-boat-specifications.dto';

@Injectable()
export class BoatsSpecificationService {
  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to fetch boat specifications')
  async getSpecificationsByType(
    params: GetBoatSpecificationsDto,
  ): Promise<any> {
    const { type, search, limit = 20 } = params;

    const where: Prisma.BoatSpecificationWhereInput = {
      type,
      isDeleted: false,
    };

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive', // * case-insensitive search
      };
    }

    const [total, items] = await this.prisma.$transaction([
      this.prisma.boatSpecification.count({ where }),
      this.prisma.boatSpecification.findMany({
        where,
        orderBy: { name: 'asc' },
        take: limit,
        select: { name: true },
      }),
    ]);

    const names = items.map((i) => i.name);

    if (!names?.length) {
      return {
        success: true,
        message: `No ${type} specifications found ${search ? `for ${search}` : ''}`,
        type,
        count: 0,
        items: [],
      };
    }

    return {
      success: true,
      message: `Successfully fetched ${type} specifications ${search ? `for ${search}` : ''}`,
      type,
      count: total,
      items: names,
    };
  }
}
