import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ListingFilterDto } from '../dto/listing-filter.dto';
import { UpdateListingDto } from '../dto/update-listing.dto';
@Injectable()
export class ListingManagementService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(query: ListingFilterDto) {
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    const search = query.search?.trim();

    const whereCondition = search
      ? {
          OR: [
            { id: { contains: search } },
            { boatName: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.client.boats.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.client.boats.count({ where: whereCondition }),
    ]);

    return {
      page,
      limit,
      total,
      items,
    };
  }

  async getById(id: string) {
    const boat = await this.prisma.client.boats.findUnique({
      where: { id },
    });

    if (!boat) throw new NotFoundException('Listing not found');

    return boat;
  }

  async update(id: string, dto: UpdateListingDto) {
    await this.getById(id);
    return this.prisma.client.boats.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    await this.getById(id);

    return this.prisma.client.boats.delete({
      where: { id },
    });
  }
}
