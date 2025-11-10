import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { BoatSpecificationType, DataInsertSource } from '@prisma/client';
import { BOAT_SPECIFICATIONS_SEED } from '../data/boat-specifications.data';

@Injectable()
export class BoatsSpecificationService implements OnModuleInit {
  private readonly logger = new Logger(BoatsSpecificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('[INIT] Boat Specifications Seeding Started');
    try {
      await this.seedAll();
      this.logger.log(
        '[DONE] Boat Specifications Seeding Completed Successfully',
      );
    } catch (error) {
      this.logger.error(
        '[FAILED] Boat Specifications Seeding Failed',
        error as any,
      );
    }
  }

  private async seedAll(): Promise<void> {
    for (const [type, names] of Object.entries(BOAT_SPECIFICATIONS_SEED) as [
      BoatSpecificationType,
      string[],
    ][]) {
      await this.seedByType(type, names);
    }
  }

  private async seedByType(
    type: BoatSpecificationType,
    items: string[],
  ): Promise<void> {
    this.logger.log(`[SEED] ${type} (${items.length} items)`);

    for (const rawName of items) {
      const name = rawName?.toString().trim();
      if (!name) continue;

      try {
        const existing = await this.prisma.boatSpecification.findFirst({
          where: { type, name },
        });

        if (existing) {
          this.logger.log(
            `[EXIST] ${type} → "${name}" already exists, skipping...`,
          );
          continue;
        }

        await this.prisma.boatSpecification.create({
          data: {
            type,
            name,
            source: DataInsertSource.SYSTEM,
            isDeleted: false,
          },
        });

        this.logger.log(`[CREATED] ${type} → "${name}" inserted.`);
      } catch (error) {
        this.logger.error(
          `[ERROR] Failed to create ${type} → "${name}": ${(error as any)?.message ?? error}`,
        );
      }
    }

    this.logger.log(`[COMPLETE] ${type} seeding done`);
  }
}
