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

    console.log('═══════════════════════════════════════════════════════════');
    console.log('🚀 Featured Yacht Cron Service Initializing...');
    console.log(
      `   ├─ Status: ${this.cronEnabled ? '✅ ENABLED' : '❌ DISABLED'}`,
    );
    console.log(`   ├─ Rotation Days: ${this.rotationDays}`);
    console.log(`   ├─ Schedule: Daily at Midnight`);
    console.log(`   └─ Timezone: America/New_York`);
    console.log('═══════════════════════════════════════════════════════════');
  }

  /**
   * Check featured yachts on server startup and run rotation if empty
   */
  async onModuleInit() {
    if (!this.cronEnabled) {
      console.log(
        '⏭️  Featured yacht cron is disabled - skipping startup check',
      );
      return;
    }

    console.log('\n🔍 Checking featured yachts on server startup...');

    try {
      // Check FLORIDA site
      await this.checkAndRotateOnStartup(SiteType.FLORIDA);

      // Check JUPITER site
      await this.checkAndRotateOnStartup(SiteType.JUPITER);

      console.log('✅ Startup featured yacht check completed\n');
    } catch (error) {
      console.error('❌ Error during startup featured yacht check:', error);
    }
  }

  /**
   * Check if featured yacht exists for a site and rotate if empty
   */
  private async checkAndRotateOnStartup(site: SiteType): Promise<void> {
    console.log(`\n📌 Checking ${site} site...`);

    const featured = await this.prisma.client.featuredYacht.findUnique({
      where: { site },
      include: { boat: true },
    });

    if (!featured) {
      console.log(`   ⚠️  No featured yacht found for ${site}`);
      console.log(`   🔄 Running instant rotation for ${site}...`);
      await this.rotateFeaturedYacht(site);
    } else {
      const now = new Date();
      const isExpired = featured.expiresAt <= now;

      console.log(`   ✅ Featured yacht exists for ${site}`);
      console.log(
        `   ├─ Boat: ${featured.boat?.name || 'N/A'} (${featured.boatId})`,
      );
      console.log(`   ├─ Featured At: ${featured.featuredAt.toISOString()}`);
      console.log(`   ├─ Expires At: ${featured.expiresAt.toISOString()}`);
      console.log(`   └─ Status: ${isExpired ? '⏰ EXPIRED' : '✅ VALID'}`);

      if (isExpired) {
        console.log(`   🔄 Running instant rotation due to expiration...`);
        await this.rotateFeaturedYacht(site);
      }
    }
  }

  async rotateFeaturedYacht(site: SiteType): Promise<void> {
    console.log(`\n🔄 Starting rotation for ${site}...`);

    try {
      console.log(`   ├─ Step 1: Fetching current featured yacht...`);
      const currentFeatured = await this.prisma.client.featuredYacht.findUnique(
        {
          where: { site },
          include: { boat: true },
        },
      );

      const now = new Date();

      // If featured yacht exists and hasn't expired, skip rotation
      if (currentFeatured && currentFeatured.expiresAt > now) {
        console.log(
          `   ├─ Current featured yacht: ${currentFeatured.boat?.name || 'N/A'}`,
        );
        console.log(
          `   ├─ Expires at: ${currentFeatured.expiresAt.toISOString()}`,
        );
        console.log(`   └─ ✅ Still valid - skipping rotation`);
        return;
      }

      if (currentFeatured) {
        console.log(
          `   ├─ Current featured yacht expired: ${currentFeatured.boat?.name || 'N/A'}`,
        );
      } else {
        console.log(`   ├─ No featured yacht found`);
      }

      console.log(`   ├─ Step 2: Fetching active boats...`);
      const activeBoats = await this.prisma.client.boats.findMany({
        where: {
          status: 'ACTIVE',
        },
      });

      console.log(`   ├─ Found ${activeBoats.length} active boat(s)`);

      if (activeBoats.length === 0) {
        console.log(`   └─ ⚠️  No active boats available for rotation`);
        this.logger.warn(
          `No active boats found for ${site} featured yacht rotation`,
        );
        return;
      }

      console.log(`   ├─ Step 3: Filtering available boats...`);
      const availableBoats = activeBoats.filter(
        (boat) => boat.id !== currentFeatured?.boatId,
      );

      console.log(
        `   ├─ Available boats for rotation: ${availableBoats.length}`,
      );

      if (availableBoats.length === 0) {
        console.log(`   ├─ ⚠️  No different boats available`);
        // If only one boat exists, we can still feature it
        if (activeBoats.length === 1) {
          const selectedBoat = activeBoats[0];
          console.log(
            `   ├─ Using the only available boat: ${selectedBoat.name}`,
          );
          console.log(`   ├─ Step 4: Setting featured yacht...`);
          await this.setFeaturedYacht(selectedBoat.id, site);
          console.log(`   └─ ✅ Featured yacht set successfully`);
          return;
        }
        console.log(`   └─ ❌ No boats available for rotation`);
        return;
      }

      console.log(`   ├─ Step 4: Randomly selecting boat...`);
      const randomIndex = Math.floor(Math.random() * availableBoats.length);
      const selectedBoat = availableBoats[randomIndex];

      console.log(
        `   ├─ Selected boat: ${selectedBoat.name} (${selectedBoat.id})`,
      );
      console.log(`   ├─ Step 5: Updating featured yacht in database...`);

      await this.setFeaturedYacht(selectedBoat.id, site);

      console.log(`   └─ ✅ Successfully rotated featured yacht for ${site}`);
      console.log(`      └─ New featured: ${selectedBoat.name}`);

      this.logger.log(
        `Successfully rotated featured yacht for ${site}: Boat ID ${selectedBoat.id} (${selectedBoat.name})`,
      );
    } catch (error) {
      console.error(`   └─ ❌ Rotation failed for ${site}:`, error);
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

    console.log(`      ├─ Boat ID: ${boatId}`);
    console.log(`      ├─ Featured At: ${now.toISOString()}`);
    console.log(
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
    console.log(
      '\n═══════════════════════════════════════════════════════════',
    );
    console.log('🔄 Starting featured yacht rotation for all sites');
    console.log('═══════════════════════════════════════════════════════════');

    await Promise.all([
      this.rotateFeaturedYacht(SiteType.FLORIDA),
      this.rotateFeaturedYacht(SiteType.JUPITER),
    ]);

    console.log(
      '\n═══════════════════════════════════════════════════════════',
    );
    console.log('✅ Completed featured yacht rotation for all sites');
    console.log(
      '═══════════════════════════════════════════════════════════\n',
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
      console.log('⏭️  Featured yacht cron is disabled');
      this.logger.log('Featured yacht cron is disabled');
      return;
    }

    console.log('\n⏰ Scheduled cron job triggered');
    console.log(`   Time: ${new Date().toISOString()}`);
    this.logger.log('🔄 Running scheduled featured yacht rotation');
    await this.rotateAllSites();
  }
}
