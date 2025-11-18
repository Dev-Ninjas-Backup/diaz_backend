import { HandleError } from '@/common/error/handle-error.decorator';
import {
  successPaginatedResponse,
  successResponse,
  TPaginatedResponse,
  TResponse,
} from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { UtilsService } from '@/lib/utils/utils.service';
import { Injectable } from '@nestjs/common';
import { BoatImage } from '@prisma/client';
import { GetAllBoatsCustomDto } from '../dto/get-all-boats-custom.dto';

@Injectable()
export class GetCustomBoatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService,
  ) {}

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

  public formatBoat(boat: any) {
    const formattedImages = (boat.images ?? []).map((img: any) => ({
      id: img.id,
      fileId: img.fileId,
      url: img.file?.url ?? null,
      mimeType: img.file?.mimeType ?? null,
      imageType: img.imageType,
      createdAt: img.createdAt,
      updatedAt: img.updatedAt,
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

    // Ensure feature arrays are always arrays (avoid null)
    const electronics = Array.isArray(boat.electronics) ? boat.electronics : [];
    const insideEquipment = Array.isArray(boat.insideEquipment)
      ? boat.insideEquipment
      : [];
    const outsideEquipment = Array.isArray(boat.outsideEquipment)
      ? boat.outsideEquipment
      : [];
    const electricalEquipment = Array.isArray(boat.electricalEquipment)
      ? boat.electricalEquipment
      : [];
    const covers = Array.isArray(boat.covers) ? boat.covers : [];
    const additionalEquipment = Array.isArray(boat.additionalEquipment)
      ? boat.additionalEquipment
      : [];

    return {
      // basic
      id: boat.id,
      listingId: boat.listingId,
      userId: boat.userId,
      owner,

      // main info
      name: boat.name,
      price: boat.price,
      description: boat.description ?? null,
      buildYear: boat.buildYear,

      // specifications
      make: boat.make,
      model: boat.model,
      fuelType: boat.fuelType,
      class: boat.class,
      material: boat.material,
      condition: boat.condition,
      engineType: boat.engineType ?? null,
      propType: boat.propType ?? null,
      propMaterial: boat.propMaterial ?? null,

      // feature lists
      electronics,
      insideEquipment,
      outsideEquipment,
      electricalEquipment,
      covers,
      additionalEquipment,

      // numeric dimensions
      length: boat.length,
      beam: boat.beam,
      draft: boat.draft,

      boatDimensions: {
        lengthFeet: this.decimalToFeetAndInches(boat.length).feet,
        lengthInches: this.decimalToFeetAndInches(boat.length).inches,
        beamFeet: this.decimalToFeetAndInches(boat.beam).feet,
        beamInches: this.decimalToFeetAndInches(boat.beam).inches,
        draftFeet: this.decimalToFeetAndInches(boat.draft).feet,
        draftInches: this.decimalToFeetAndInches(boat.draft).inches,
      },

      enginesNumber: boat.enginesNumber,
      cabinsNumber: boat.cabinsNumber,
      headsNumber: boat.headsNumber,

      // address
      city: boat.city,
      state: boat.state,
      zip: boat.zip,

      // extra details
      extraDetails: this.utils.safeParseJson(boat.extraDetails, {}) ?? null,

      // status & media
      status: boat.status,
      videoURL: boat.videoURL ?? null,

      // relations
      engines: boat.engines ?? [],
      coverImages,
      galleryImages,

      // timestamps
      createdAt: boat.createdAt,
      updatedAt: boat.updatedAt,
    };
  }

  private decimalToFeetAndInches(decimalValue: number | null) {
    if (decimalValue == null || isNaN(decimalValue)) {
      return { feet: 0, inches: 0 };
    }
    const feet = Math.floor(decimalValue);
    const inches = Math.round((decimalValue - feet) * 12);
    return { feet, inches };
  }
}
