import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BoatListingStatus } from 'generated/client';
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

    const whereCondition: any = {
      ...(search
        ? {
            OR: [
              { id: { contains: search, mode: 'insensitive' } },
              { listingId: { contains: search, mode: 'insensitive' } },
              { name: { contains: search, mode: 'insensitive' } },
              { make: { contains: search, mode: 'insensitive' } },
              { model: { contains: search, mode: 'insensitive' } },
              {
                user: {
                  OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                  ],
                },
              },
            ],
          }
        : {}),
      ...(query.status ? { status: query.status as BoatListingStatus } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.client.boats.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.client.boats.count({ where: whereCondition }),
    ]);

    const listingIds = items.map((b) => b.listingId).filter(Boolean);
    const views = listingIds.length
      ? await this.prisma.client.pageView.groupBy({
          by: ['page'],
          where: { page: { in: listingIds as string[] } },
          _sum: { count: true },
        })
      : [];
    const viewsMap = new Map(views.map((v) => [v.page, v._sum.count ?? 0]));

    const formatted = items.map((boat) => ({
      id: boat.id,
      listingId: boat.listingId,
      name: boat.name,
      make: boat.make,
      model: boat.model,
      year: boat.buildYear,
      price: boat.price,
      status: boat.status,
      views: viewsMap.get(boat.listingId) ?? 0,
      createdAt: boat.createdAt,
      seller: boat.user
        ? { id: boat.user.id, name: boat.user.name, email: boat.user.email }
        : null,
    }));

    return {
      page,
      limit,
      total,
      items: formatted,
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
