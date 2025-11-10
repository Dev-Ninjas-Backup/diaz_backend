import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { BoatFeatureType, DataInsertSource } from '@prisma/client';
import { BOAT_FEATURES_SEED } from '../data/boat-features.data';

@Injectable()
export class BoatsFeatureService implements OnModuleInit {
  private readonly logger = new Logger(BoatsFeatureService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('Seeding Boats Feature Data...');
    try {
      await this.seedAll();
      this.logger.log('Boats Feature seeding completed.');
    } catch (err) {
      this.logger.error('Boats Feature seeding failed', err);
    }
  }

  private async seedAll(): Promise<void> {
    for (const [type, names] of Object.entries(BOAT_FEATURES_SEED) as [
      BoatFeatureType,
      string[],
    ][]) {
      await this.seedType(type, names);
    }
  }

  private async seedType(
    type: BoatFeatureType,
    names: string[],
  ): Promise<void> {
    if (!names?.length) return;
    this.logger.log(`Seeding ${type} (${names.length} items)`);

    for (const name of names) {
      const trimmed = name.trim();
      if (!trimmed) continue;

      const exists = await this.prisma.boatFeature.findFirst({
        where: { type, name: trimmed },
      });

      if (!exists) {
        await this.prisma.boatFeature.create({
          data: {
            type,
            name: trimmed,
            source: DataInsertSource.SYSTEM,
          },
        });
      }
    }
  }
}
