import { GoogleContentService } from '@/lib/googleapis/services/google-content.service';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BoatListingStatus, Prisma } from 'generated/client';
import { ListingFilterDto } from '../dto/listing-filter.dto';
import { UpdateListingDto } from '../dto/update-listing.dto';
import { AdminBoatListingHelperService } from './adminboat-listing-helper.service';
@Injectable()
export class ListingManagementService {
  private readonly logger = new Logger(ListingManagementService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly adminBoatHelper: AdminBoatListingHelperService,
    private readonly googleContentService: GoogleContentService,
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
    const { extraDetails, engines, ...rest } = dto;
    const updateData: Prisma.BoatsUpdateInput = {
      ...rest,
      ...(extraDetails !== undefined && {
        extraDetails: JSON.parse(
          JSON.stringify(extraDetails),
        ) as Prisma.InputJsonValue,
      }),
    };

    await this.prisma.client.boats.update({
      where: { id },
      data: updateData,
    });

    if (engines) {
      const existingEngines = await this.prisma.client.boatEngine.findMany({
        where: { boatId: id },
      });

      await this.adminBoatHelper.syncBoatsEngines(
        id,
        existingEngines as any,
        engines as any,
      );
    }

    return this.getById(id);
  }

  async delete(id: string) {
    await this.getById(id);

    return this.prisma.client.boats.delete({
      where: { id },
    });
  }

  async syncOneWithGmc(id: string) {
    await this.getById(id);
    await this.googleContentService.syncBoatWithGmc(id);
    return { message: `Boat ${id} synced to Google Merchant Center` };
  }

  async syncAllWithGmc() {
    const boats = await this.prisma.client.boats.findMany({
      select: { id: true },
    });

    const results = { success: 0, failed: 0, total: boats.length };

    for (const boat of boats) {
      try {
        await this.googleContentService.syncBoatWithGmc(boat.id);
        results.success++;
      } catch (err) {
        this.logger.error(`Failed to sync boat ${boat.id} to GMC`, err);
        results.failed++;
      }
    }

    return results;
  }
}
