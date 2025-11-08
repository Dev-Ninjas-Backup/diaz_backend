import { HandleError } from '@/common/error/handle-error.decorator';
import { successResponse, TResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BoatsService {
  constructor(private readonly prisma: PrismaService) {}

  @HandleError('Failed to get boat details', 'Boats')
  async getSingleBoatDetails(boatId: string): Promise<TResponse<any>> {
    const boat = await this.prisma.boats.findUniqueOrThrow({
      where: { id: boatId },
      include: {
        engines: true,
        images: {
          include: {
            file: true,
          },
        },
      },
    });

    return successResponse(boat, 'Boat details fetched successfully');
  }
}
