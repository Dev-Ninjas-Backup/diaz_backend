import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SiteType } from 'generated/enums';

@Injectable()
export class FeaturedYachtCronService implements OnModuleInit {
  private readonly logger = new Logger(FeaturedYachtCronService.name);
  private readonly cronEnabled: boolean;
  private readonly rotationDays: number;
  private readonly featuredCount: number = 5;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.cronEnabled =
      this.configService.get<string>('FEATURED_YACHT_CRON_ENABLED', 'true') ===
      'true';
    this.rotationDays = parseInt(
      this.configService.get<string>('FEATURED_YACHT_ROTATION_DAYS', '7'),
      10,
    );

    this.logger.log(
      '═══════════════════════════════════════════════════════════',
    );
    this.logger.log('Featured Yacht Cron Service Initializing...');
    this.logger.log(`   Status: ${this.cronEnabled ? 'ENABLED' : 'DISABLED'}`);
    this.logger.log(`   Rotation Days: ${this.rotationDays}`);
    this.logger.log(`   Featured Count: ${this.featuredCount}`);
    this.logger.log(`   Schedule: Daily at Midnight`);
    this.logger.log(`   Timezone: America/New_York`);
    this.logger.log(
      '═══════════════════════════════════════════════════════════',
    );
  }

  async onModuleInit() {
    if (!this.cronEnabled) {
      this.logger.log(
        'Featured yacht cron is disabled - skipping startup check',
      );
      return;
    }

    this.logger.log('Checking featured yachts on server startup...');

    try {
      await this.checkAndRotateOnStartup(SiteType.FLORIDA);
      await this.checkAndRotateOnStartup(SiteType.JUPITER);
      this.logger.log('Startup featured yacht check completed');
    } catch (error) {
      this.logger.error(
        'Error during startup featured yacht check:',
        error instanceof Error ? error.stack : error,
      );
    }
  }

  private async checkAndRotateOnStartup(site: SiteType): Promise<void> {
    this.logger.log(`Checking ${site} site...`);

    const now = new Date();

    // Check if there are any active (non-expired) featured yachts for this site
    const activeFeatured = await this.prisma.client.featuredYacht.findMany({
      where: {
        site,
        expiresAt: { gt: now },
      },
    });

    if (activeFeatured.length === 0) {
      this.logger.log(`No active featured yachts for ${site} - rotating now`);
      await this.rotateFeaturedYacht(site);
    } else {
      this.logger.log(
        `${activeFeatured.length} active featured yacht(s) for ${site} - still valid`,
      );
    }
  }

  async rotateFeaturedYacht(site: SiteType): Promise<void> {
    this.logger.log(`Starting rotation for ${site}...`);

    try {
      const now = new Date();

      // Step 1: Delete all expired featured yachts for this site
      const deleted = await this.prisma.client.featuredYacht.deleteMany({
        where: {
          site,
          expiresAt: { lte: now },
        },
      });
      this.logger.log(
        `Cleaned up ${deleted.count} expired featured yacht(s) for ${site}`,
      );

      // Step 2: Check if there are still active featured yachts
      const activeFeatured = await this.prisma.client.featuredYacht.findMany({
        where: {
          site,
          expiresAt: { gt: now },
        },
      });

      if (activeFeatured.length >= this.featuredCount) {
        this.logger.log(
          `${site} already has ${activeFeatured.length} active featured yachts - skipping`,
        );
        return;
      }

      // Step 3: Get all active boats
      const activeBoats = await this.prisma.client.boats.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true, name: true },
      });

      this.logger.log(`Found ${activeBoats.length} active boat(s)`);

      if (activeBoats.length === 0) {
        this.logger.warn(
          `No active boats found for ${site} featured yacht rotation`,
        );
        return;
      }

      // Step 4: Get IDs of boats that are currently featured (active, non-expired)
      const currentlyFeaturedIds = activeFeatured.map((fy) => fy.boatId);

      // Step 5: Get IDs of boats that were previously featured (to avoid repeats)
      // We look at all featured yacht records ever created for this site
      const previouslyFeatured =
        await this.prisma.client.featuredYacht.findMany({
          where: { site },
          select: { boatId: true },
        });
      const previouslyFeaturedIds = previouslyFeatured.map((fy) => fy.boatId);

      // Step 6: Filter to boats that haven't been featured yet
      let availableBoats = activeBoats.filter(
        (boat) =>
          !currentlyFeaturedIds.includes(boat.id) &&
          !previouslyFeaturedIds.includes(boat.id),
      );

      this.logger.log(
        `${availableBoats.length} boats available (not previously featured)`,
      );

      // Step 7: If all boats have been featured, reset the cycle
      if (availableBoats.length === 0) {
        this.logger.log(
          `All boats have been featured for ${site} - resetting cycle`,
        );

        // Delete ALL featured yacht records for this site to reset history
        await this.prisma.client.featuredYacht.deleteMany({
          where: { site },
        });

        // All active boats are now available again
        availableBoats = [...activeBoats];
      }

      // Step 8: Determine how many to select
      const needed = this.featuredCount - currentlyFeaturedIds.length;
      const toSelect = Math.min(needed, availableBoats.length);

      // Step 9: Randomly select boats
      const shuffled = availableBoats.sort(() => Math.random() - 0.5);
      const selectedBoats = shuffled.slice(0, toSelect);

      this.logger.log(
        `Selected ${selectedBoats.length} boats for ${site}: ${selectedBoats.map((b) => b.name).join(', ')}`,
      );

      // Step 10: Create featured yacht records
      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + this.rotationDays);

      for (const boat of selectedBoats) {
        await this.prisma.client.featuredYacht.create({
          data: {
            boatId: boat.id,
            site,
            featuredAt: now,
            expiresAt,
          },
        });
      }

      this.logger.log(
        `Successfully set ${selectedBoats.length} featured yachts for ${site} (expires: ${expiresAt.toISOString()})`,
      );
    } catch (error) {
      this.logger.error(
        `Rotation failed for ${site}:`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  async rotateAllSites(): Promise<void> {
    this.logger.log(
      '═══════════════════════════════════════════════════════════',
    );
    this.logger.log('Starting featured yacht rotation for all sites');
    this.logger.log(
      '═══════════════════════════════════════════════════════════',
    );

    await this.rotateFeaturedYacht(SiteType.FLORIDA);
    await this.rotateFeaturedYacht(SiteType.JUPITER);

    this.logger.log(
      '═══════════════════════════════════════════════════════════',
    );
    this.logger.log('Completed featured yacht rotation for all sites');
    this.logger.log(
      '═══════════════════════════════════════════════════════════',
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: 'America/New_York',
    name: 'featured-yacht-rotation',
  })
  async handleDailyRotation(): Promise<void> {
    if (!this.cronEnabled) {
      this.logger.log('Featured yacht cron is disabled');
      return;
    }

    this.logger.log('Scheduled cron job triggered');
    this.logger.log(`   Time: ${new Date().toISOString()}`);
    await this.rotateAllSites();
  }
}
