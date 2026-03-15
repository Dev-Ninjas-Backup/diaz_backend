import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BoatListingStatus, Prisma } from 'generated/client';
import { ListingFilterDto } from '../dto/listing-filter.dto';
import { UpdateListingDto } from '../dto/update-listing.dto';
import { AdminBoatListingHelperService } from './adminboat-listing-helper.service';
@Injectable()
export class ListingManagementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: AdminBoatListingHelperService,
  ) {}

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
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            phone: true,
            avatarUrl: true,
          },
        },
        images: {
          include: { file: true },
          orderBy: { createdAt: 'asc' },
        },
        engines: { orderBy: { createdAt: 'asc' } },
        featuredYachts: {
          select: { id: true, site: true, featuredAt: true, expiresAt: true },
        },
      },
    });

    if (!boat) throw new NotFoundException('Listing not found');

    const views = boat.listingId
      ? await this.prisma.client.pageView.aggregate({
          where: { page: boat.listingId },
          _sum: { count: true },
        })
      : null;

    const formattedImages = (boat.images ?? []).map((img) => ({
      id: img.id,
      fileId: img.fileId,
      url: img.file?.url ?? null,
      mimeType: img.file?.mimeType ?? null,
      originalFilename: img.file?.originalFilename ?? null,
      imageType: img.imageType,
      createdAt: img.createdAt,
    }));

    return {
      ...boat,
      images: undefined,
      coverImages: formattedImages.filter((img) => img.imageType === 'COVER'),
      galleryImages: formattedImages.filter(
        (img) => img.imageType === 'GALLERY',
      ),
      views: views?._sum?.count ?? 0,
    };
  }

  async update(id: string, dto: UpdateListingDto) {
    const boat = await this.getById(id);

    const { extraDetails, engines, ...rest } = dto;
    const updateData: Prisma.BoatsUpdateInput = {
      ...rest,
      ...(extraDetails !== undefined && {
        extraDetails: JSON.parse(
          JSON.stringify(extraDetails),
        ) as Prisma.InputJsonValue,
      }),
    };

    // Update boat data
    await this.prisma.client.boats.update({
      where: { id },
      data: updateData,
    });

    // Sync engines if provided
    if (engines !== undefined) {
      const existingEngines = (boat.engines ?? []).map((engine) => ({
        id: engine.id,
        hours: engine.hours ?? undefined,
        horsepower: engine.horsepower ?? undefined,
        make: engine.make ?? undefined,
        model: engine.model ?? undefined,
        fuelType: engine.fuelType ?? undefined,
        propellerType: engine.propellerType ?? undefined,
      }));

      await this.helperService.syncBoatsEngines(id, existingEngines, engines);
    }

    return this.getById(id);
  }

  async delete(id: string) {
    await this.getById(id);

    return this.prisma.client.boats.delete({
      where: { id },
    });
  }
}
