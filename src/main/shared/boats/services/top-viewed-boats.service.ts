import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TopViewedBoatsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getBoatPageViews(boatId: string): Promise<number> {
    const page = `/search-listing/${boatId}`;

    const result = await this.prisma.client.pageView.aggregate({
      _sum: { count: true },
      where: { page },
    });

    return result._sum.count ?? 0;
  }

  async getTopViewedBoats() {
    const boats = await this.prisma.client.boats.findMany({
      include: {
        images: {
          include: { file: true },
        },
      },
    });

    const boatsWithViews = await Promise.all(
      boats.map(async (boat) => {
        const pageViewCount = await this.getBoatPageViews(boat.id);

        return {
          ...boat,
          pageViewCount,
        };
      }),
    );

    boatsWithViews.sort((a, b) => b.pageViewCount - a.pageViewCount);

    return boatsWithViews.slice(0, 10);
  }
}
