import { HandleError } from '@/common/error/handle-error.decorator';
import { TResponse, successResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { SiteType } from 'generated/enums';

@Injectable()
export class FeaturedYachtService {
  private readonly logger = new Logger(FeaturedYachtService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get the current featured yacht for a site
   * Always returns minimum 5 boats
   */
  @HandleError('Failed to get featured yacht')
  async getCurrentFeaturedYacht(site: SiteType): Promise<TResponse<any>> {
    const now = new Date();
    const MIN_BOATS = 5;

    // First, get featured yachts that haven't expired
    const featuredYachts = await this.prisma.client.featuredYacht.findMany({
      where: {
        site,
        expiresAt: {
          gte: now, // Only return non-expired featured yachts
        },
      },
      include: {
        boat: {
          include: {
            images: {
              include: {
                file: true,
              },
            },
            engines: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: {
        featuredAt: 'desc', // Most recently featured first
      },
    });

    // Extract boat IDs that are already featured
    const featuredBoatIds = featuredYachts.map((fy) => fy.boatId);

    // If we have less than MIN_BOATS, supplement with additional boats
    let boats: any[] = featuredYachts;

    if (boats.length < MIN_BOATS) {
      const needed = MIN_BOATS - boats.length;

      this.logger.log(
        `Only ${boats.length} featured yachts found for ${site}. Fetching ${needed} additional boats to meet minimum of ${MIN_BOATS}.`,
      );

      // Fetch additional active boats that are not already featured
      const additionalBoats = await this.prisma.client.boats.findMany({
        where: {
          status: 'ACTIVE',
          id: {
            notIn: featuredBoatIds.length > 0 ? featuredBoatIds : undefined, // Exclude already featured boats
          },
        },
        include: {
          images: {
            include: {
              file: true,
            },
          },
          engines: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc', // Most recent boats first
        },
        take: needed,
      });

      // Transform additional boats to match featured yacht structure
      const transformedBoats = additionalBoats.map((boat) => ({
        id: null, // Not a featured yacht record
        boatId: boat.id,
        site: site,
        featuredAt: null,
        expiresAt: null,
        createdAt: boat.createdAt,
        updatedAt: boat.updatedAt,
        boat: boat,
      }));

      boats = [...boats, ...transformedBoats];
    }

    return successResponse(boats);
  }

  /**
   * Get featured yacht history (optional feature)
   */
  @HandleError('Failed to get featured yacht history')
  async getFeaturedYachtHistory(site?: SiteType) {
    const where = site ? { site } : undefined;

    const history = await this.prisma.client.featuredYacht.findMany({
      where,
      include: {
        boat: {
          include: {
            images: {
              include: {
                file: true,
              },
              take: 1, // Just get cover image
            },
          },
        },
      },
      orderBy: {
        featuredAt: 'desc',
      },
    });

    return successResponse(history);
  }
}
