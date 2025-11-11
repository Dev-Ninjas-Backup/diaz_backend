import { HandleError } from '@/common/error/handle-error.decorator';
import {
  autoCompleteResponse,
  TAutoCompleteResponse,
} from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { BoatSpecificationType, Prisma } from '@prisma/client';
import { GetBoatSpecificationsDto } from '../dto/get-boat-specifications.dto';

@Injectable()
export class BoatsSpecificationService {
  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to fetch boat specifications')
  async getSpecificationsByType(
    params: GetBoatSpecificationsDto,
  ): Promise<TAutoCompleteResponse<BoatSpecificationType>> {
    const { type, search, limit = 20 } = params;

    const where: Prisma.BoatSpecificationWhereInput = {
      type,
      isDeleted: false,
    };

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
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

    return autoCompleteResponse(
      type,
      total,
      names,
      `Successfully fetched ${type} specifications ${search ? `for ${search}` : ''}`,
    );
  }
}
