import { HandleError } from '@/common/error/handle-error.decorator';
import { successResponse, TResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetSingleBoatService {
  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to get boat details', 'Boats')
  async getSingleBoatDetails(boatId: string): Promise<TResponse<any>> {
    const boat = await this.prisma.boats.findUniqueOrThrow({
      where: { id: boatId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        engines: true,
        images: {
          include: {
            file: true,
          },
        },
      },
    });

    // Simplify & split images by type
    const formattedImages = boat.images.map((img) => ({
      id: img.id,
      fileId: img.fileId,
      url: img.file?.url ?? null,
      mimeType: img.file?.mimeType ?? null,
      imageType: img.imageType,
    }));

    const coverImages = formattedImages.filter(
      (img) => img.imageType === 'COVER',
    );
    const galleryImages = formattedImages.filter(
      (img) => img.imageType === 'GALLERY',
    );

    // Simplify owner info
    const owner = boat.user
      ? {
          id: boat.user.id,
          name: boat.user.name,
          email: boat.user.email,
          avatarUrl: boat.user.avatarUrl,
        }
      : null;

    // Final formatted response
    const formattedBoat = {
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
      extraDetails: boat.extraDetails,
      status: boat.status,
      createdAt: boat.createdAt,
      updatedAt: boat.updatedAt,
      owner,
      engines: boat.engines,
      coverImages,
      galleryImages,
    };

    return successResponse(formattedBoat, 'Boat details fetched successfully');
  }
}
