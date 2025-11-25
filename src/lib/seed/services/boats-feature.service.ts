import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { BoatFeatureType, DataInsertSource } from 'generated/client';
import { BOAT_FEATURES_SEED } from '../data/boat-features.data';

@Injectable()
export class BoatsFeatureService implements OnModuleInit {
  private readonly logger = new Logger(BoatsFeatureService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    this.logger.log('[INIT] Boat Features Seeding Started');
    try {
      await this.seedAll();
      this.logger.log('[DONE] Boat Features Seeding Completed Successfully');
    } catch (error) {
      this.logger.error('[FAILED] Boat Features Seeding Failed', error);
    }
  }

  private async seedAll() {
    for (const [type, names] of Object.entries(BOAT_FEATURES_SEED) as [
      BoatFeatureType,
      string[],
    ][]) {
      await this.seedByType(type, names);
    }
  }

  private async seedByType(type: BoatFeatureType, features: string[]) {
    this.logger.log(`[SEED] ${type} (${features.length} items)`);

    for (const featureName of features) {
      const name = featureName.trim();
      if (!name) continue;

      const existing = await this.prisma.client.boatFeature.findFirst({
        where: { type, name },
      });

      if (existing) {
        // this.logger.log(
        //   `[EXIST] ${type} → "${name}" already exists, skipping...`,
        // );
        continue;
      }

      try {
        await this.prisma.client.boatFeature.create({
          data: {
            type,
            name,
            source: DataInsertSource.SYSTEM,
          },
        });
        this.logger.log(`[CREATED] ${type} → "${name}" successfully inserted.`);
      } catch (error) {
        this.logger.error(
          `[ERROR] Failed to create ${type} → "${name}": ${(error as any).message}`,
        );
      }
    }

    this.logger.log(`[COMPLETE] ${type} seeding done`);
  }
}
