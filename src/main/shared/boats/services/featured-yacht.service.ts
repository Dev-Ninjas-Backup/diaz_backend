import { HandleError } from '@/common/error/handle-error.decorator';
import { TResponse, successResponse } from '@/common/utils/response.util';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SiteType } from 'generated/enums';

@Injectable()
export class FeaturedYachtService {
  private readonly logger = new Logger(FeaturedYachtService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get the current featured yacht for a site
   */
  @HandleError('Failed to get featured yacht')
  async getCurrentFeaturedYacht(site: SiteType): Promise<TResponse<any>> {
    const featuredYacht = await this.prisma.client.featuredYacht.findUnique({
      where: { site },
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
    });

    if (!featuredYacht) {
      throw new NotFoundException(`No featured yacht found for site: ${site}`);
    }

    // Check if featured yacht has expired
    const now = new Date();
    if (featuredYacht.expiresAt < now) {
      this.logger.warn(
        `Featured yacht for ${site} has expired. Consider running rotation cron job.`,
      );
    }

    return successResponse(featuredYacht);
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
