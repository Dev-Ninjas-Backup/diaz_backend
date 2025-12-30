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
    this.logger.log('🚀 Featured Yacht Cron Service Initializing...');
    this.logger.log(
      `   ├─ Status: ${this.cronEnabled ? '✅ ENABLED' : '❌ DISABLED'}`,
    );
    this.logger.log(`   ├─ Rotation Days: ${this.rotationDays}`);
    this.logger.log(`   ├─ Schedule: Daily at Midnight`);
    this.logger.log(`   └─ Timezone: America/New_York`);
    this.logger.log(
      '═══════════════════════════════════════════════════════════',
    );
  }

  /**
   * Check featured yachts on server startup and run rotation if empty
   */
  async onModuleInit() {
    if (!this.cronEnabled) {
      this.logger.log(
        '⏭️  Featured yacht cron is disabled - skipping startup check',
      );
      return;
    }

    this.logger.log('🔍 Checking featured yachts on server startup...');

    try {
      // Check FLORIDA site
      await this.checkAndRotateOnStartup(SiteType.FLORIDA);

      // Check JUPITER site
      await this.checkAndRotateOnStartup(SiteType.JUPITER);

      this.logger.log('✅ Startup featured yacht check completed');
    } catch (error) {
      this.logger.error(
        '❌ Error during startup featured yacht check:',
        error instanceof Error ? error.stack : error,
      );
    }
  }

  /**
   * Check if featured yacht exists for a site and rotate if empty
   */
  private async checkAndRotateOnStartup(site: SiteType): Promise<void> {
    this.logger.log(`📌 Checking ${site} site...`);

    const featured = await this.prisma.client.featuredYacht.findUnique({
      where: { site },
      include: { boat: true },
    });

    if (!featured) {
      this.logger.log(`   ⚠️  No featured yacht found for ${site}`);
      this.logger.log(`   🔄 Running instant rotation for ${site}...`);
      await this.rotateFeaturedYacht(site);
    } else {
      const now = new Date();
      const isExpired = featured.expiresAt <= now;

      this.logger.log(`   ✅ Featured yacht exists for ${site}`);
      this.logger.log(
        `   ├─ Boat: ${featured.boat?.name || 'N/A'} (${featured.boatId})`,
      );
      this.logger.log(
        `   ├─ Featured At: ${featured.featuredAt.toISOString()}`,
      );
      this.logger.log(`   ├─ Expires At: ${featured.expiresAt.toISOString()}`);
      this.logger.log(`   └─ Status: ${isExpired ? '⏰ EXPIRED' : '✅ VALID'}`);

      if (isExpired) {
        this.logger.log(`   🔄 Running instant rotation due to expiration...`);
        await this.rotateFeaturedYacht(site);
      }
    }
  }

  async rotateFeaturedYacht(site: SiteType): Promise<void> {
    this.logger.log(`🔄 Starting rotation for ${site}...`);

    try {
      this.logger.log(`   ├─ Step 1: Fetching current featured yacht...`);
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
          `   ├─ Current featured yacht: ${currentFeatured.boat?.name || 'N/A'}`,
        );
        this.logger.log(
          `   ├─ Expires at: ${currentFeatured.expiresAt.toISOString()}`,
        );
        this.logger.log(`   └─ ✅ Still valid - skipping rotation`);
        return;
      }

      if (currentFeatured) {
        this.logger.log(
          `   ├─ Current featured yacht expired: ${currentFeatured.boat?.name || 'N/A'}`,
        );
      } else {
        this.logger.log(`   ├─ No featured yacht found`);
      }

      this.logger.log(`   ├─ Step 2: Fetching active boats...`);
      const activeBoats = await this.prisma.client.boats.findMany({
        where: {
          status: 'ACTIVE',
        },
      });

      this.logger.log(`   ├─ Found ${activeBoats.length} active boat(s)`);

      if (activeBoats.length === 0) {
        this.logger.log(`   └─ ⚠️  No active boats available for rotation`);
        this.logger.warn(
          `No active boats found for ${site} featured yacht rotation`,
        );
        return;
      }

      this.logger.log(`   ├─ Step 3: Filtering available boats...`);
      const availableBoats = activeBoats.filter(
        (boat) => boat.id !== currentFeatured?.boatId,
      );

      this.logger.log(
        `   ├─ Available boats for rotation: ${availableBoats.length}`,
      );

      if (availableBoats.length === 0) {
        this.logger.log(`   ├─ ⚠️  No different boats available`);
        // If only one boat exists, we can still feature it
        if (activeBoats.length === 1) {
          const selectedBoat = activeBoats[0];
          this.logger.log(
            `   ├─ Using the only available boat: ${selectedBoat.name}`,
          );
          this.logger.log(`   ├─ Step 4: Setting featured yacht...`);
          await this.setFeaturedYacht(selectedBoat.id, site);
          this.logger.log(`   └─ ✅ Featured yacht set successfully`);
          return;
        }
        this.logger.log(`   └─ ❌ No boats available for rotation`);
        return;
      }

      this.logger.log(`   ├─ Step 4: Randomly selecting boat...`);
      const randomIndex = Math.floor(Math.random() * availableBoats.length);
      const selectedBoat = availableBoats[randomIndex];

      this.logger.log(
        `   ├─ Selected boat: ${selectedBoat.name} (${selectedBoat.id})`,
      );
      this.logger.log(`   ├─ Step 5: Updating featured yacht in database...`);

      await this.setFeaturedYacht(selectedBoat.id, site);

      this.logger.log(
        `   └─ ✅ Successfully rotated featured yacht for ${site}`,
      );
      this.logger.log(`      └─ New featured: ${selectedBoat.name}`);

      this.logger.log(
        `Successfully rotated featured yacht for ${site}: Boat ID ${selectedBoat.id} (${selectedBoat.name})`,
      );
    } catch (error) {
      this.logger.error(
        `   └─ ❌ Rotation failed for ${site}:`,
        error instanceof Error ? error.stack : error,
      );
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
    expiresAt.setDate(expiresAt.getDate() + this.rotationDays);

    this.logger.log(`      ├─ Boat ID: ${boatId}`);
    this.logger.log(`      ├─ Featured At: ${now.toISOString()}`);
    this.logger.log(
      `      └─ Expires At: ${expiresAt.toISOString()} (${this.rotationDays} days)`,
    );

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
    this.logger.log(
      '═══════════════════════════════════════════════════════════',
    );
    this.logger.log('🔄 Starting featured yacht rotation for all sites');
    this.logger.log(
      '═══════════════════════════════════════════════════════════',
    );

    await Promise.all([
      this.rotateFeaturedYacht(SiteType.FLORIDA),
      this.rotateFeaturedYacht(SiteType.JUPITER),
    ]);

    this.logger.log(
      '═══════════════════════════════════════════════════════════',
    );
    this.logger.log('✅ Completed featured yacht rotation for all sites');
    this.logger.log(
      '═══════════════════════════════════════════════════════════',
    );

    this.logger.log('Completed featured yacht rotation for all sites');
  }

  /**
   * Daily cron job to check and rotate expired featured yachts
   * Runs every day at midnight (America/New_York timezone)
   * Can be disabled by setting FEATURED_YACHT_CRON_ENABLED=false
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: 'America/New_York',
    name: 'featured-yacht-rotation',
  })
  async handleDailyRotation(): Promise<void> {
    if (!this.cronEnabled) {
      this.logger.log('⏭️  Featured yacht cron is disabled');
      return;
    }

    this.logger.log('⏰ Scheduled cron job triggered');
    this.logger.log(`   Time: ${new Date().toISOString()}`);
    this.logger.log('🔄 Running scheduled featured yacht rotation');
    await this.rotateAllSites();
  }
}
