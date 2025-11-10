import { HandleError } from '@/common/error/handle-error.decorator';
import {
  successPaginatedResponse,
  successResponse,
  TPaginatedResponse,
  TResponse,
} from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { BoatImage } from '@prisma/client';
import { GetAllBoatsCustomDto } from '../dto/get-all-boats-custom.dto';

@Injectable()
export class GetCustomBoatsService {
  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to get boat details', 'Boats')
  async getSingleBoat(boatId: string): Promise<TResponse<any>> {
    const boat = await this.prisma.boats.findUniqueOrThrow({
      where: { id: boatId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        engines: true,
        images: { include: { file: true } },
      },
    });

    return successResponse(
      this.formatBoat(boat),
      'Boat details fetched successfully',
    );
  }

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

    const where = {};

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

    const formattedBoats = boats.map((b) => this.formatBoat(b));

    return successPaginatedResponse(
      formattedBoats,
      { page, limit, total },
      'Boats found successfully',
    );
  }

  private formatBoat(boat: any) {
    const formattedImages = (boat.images ?? []).map((img: any) => ({
      id: img.id,
      fileId: img.fileId,
      url: img.file?.url ?? null,
      mimeType: img.file?.mimeType ?? null,
      imageType: img.imageType,
    }));

    const coverImages = formattedImages.filter(
      (img: BoatImage) => img.imageType === 'COVER',
    );
    const galleryImages = formattedImages.filter(
      (img: BoatImage) => img.imageType === 'GALLERY',
    );

    const owner = boat.user
      ? {
          id: boat.user.id,
          name: boat.user.name,
          email: boat.user.email,
          avatarUrl: boat.user.avatarUrl,
        }
      : null;

    return {
      id: boat.id,
      name: boat.name,
      price: boat.price,
      description: boat.description,
      buildYear: boat.buildYear,
      make: boat.make,
      model: boat.model,
      fuelType: boat.fuelType,
      class: boat.class,
      material: boat.material,
      condition: boat.condition,
      length: boat.length,
      beam: boat.beam,
      draft: boat.draft,
      enginesNumber: boat.enginesNumber,
      cabinsNumber: boat.cabinsNumber,
      headsNumber: boat.headsNumber,
      city: boat.city,
      state: boat.state,
      zip: boat.zip,
      videoURL: boat.videoURL,
      extraDetails: boat.extraDetails,
      status: boat.status,
      createdAt: boat.createdAt,
      updatedAt: boat.updatedAt,
      owner,
      engines: boat.engines ?? [],
      coverImages,
      galleryImages,
    };
  }
}
