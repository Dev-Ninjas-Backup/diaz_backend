import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SiteType } from 'generated/enums';

@Injectable()
export class FeaturedYachtCronService {
  private readonly logger = new Logger(FeaturedYachtCronService.name);

  constructor(private readonly prisma: PrismaService) {}

  async rotateFeaturedYacht(site: SiteType): Promise<void> {
    try {
      const currentFeatured = await this.prisma.client.featuredYacht.findUnique(
        {
          where: { site },
          include: { boat: true },
        },
      );

      const now = new Date();

      // If featured yacht exists and hasn't expired, skip rotation
      if (currentFeatured && currentFeatured.expiresAt > now) {
        this.logger.log(
          `Featured yacht for ${site} is still valid until ${currentFeatured.expiresAt.toISOString()}`,
        );
        return;
      }

      // Get all active boats
      const activeBoats = await this.prisma.client.boats.findMany({
        where: {
          status: 'ACTIVE',
        },
      });

      if (activeBoats.length === 0) {
        this.logger.warn(
          `No active boats found for ${site} featured yacht rotation`,
        );
        return;
      }

      // Exclude currently featured yacht if exists
      const availableBoats = activeBoats.filter(
        (boat) => boat.id !== currentFeatured?.boatId,
      );

      if (availableBoats.length === 0) {
        this.logger.warn(
          `No available boats to rotate for ${site} (only one active boat exists)`,
        );
        // If only one boat exists, we can still feature it
        if (activeBoats.length === 1) {
          const selectedBoat = activeBoats[0];
          await this.setFeaturedYacht(selectedBoat.id, site);
          return;
        }
        return;
      }

      // Random selection
      const randomIndex = Math.floor(Math.random() * availableBoats.length);
      const selectedBoat = availableBoats[randomIndex];

      await this.setFeaturedYacht(selectedBoat.id, site);

      this.logger.log(
        `Successfully rotated featured yacht for ${site}: Boat ID ${selectedBoat.id} (${selectedBoat.name})`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to rotate featured yacht for ${site}:`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  /**
   * Set a boat as featured yacht for a site
   */
  private async setFeaturedYacht(
    boatId: string,
    site: SiteType,
  ): Promise<void> {
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 7); // Add 7 days

    await this.prisma.client.featuredYacht.upsert({
      where: { site },
      update: {
        boatId,
        featuredAt: now,
        expiresAt,
      },
      create: {
        boatId,
        site,
        featuredAt: now,
        expiresAt,
      },
    });
  }

  /**
   * Rotate featured yachts for all sites
   */
  async rotateAllSites(): Promise<void> {
    this.logger.log('Starting featured yacht rotation for all sites');
    await Promise.all([
      this.rotateFeaturedYacht(SiteType.FLORIDA),
      this.rotateFeaturedYacht(SiteType.JUPITER),
    ]);
    this.logger.log('Completed featured yacht rotation for all sites');
  }

  /**
   * Daily cron job to check and rotate expired featured yachts
   * Runs every day at midnight (America/New_York timezone)
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: 'America/New_York',
  })
  async handleDailyRotation(): Promise<void> {
    await this.rotateAllSites();
  }
}
