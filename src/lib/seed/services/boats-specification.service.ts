import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { BoatSpecificationType, DataInsertSource } from 'generated/client';
import { BOAT_MAKES_WITH_CODE } from '../data/boat-makes.data';
import { BOAT_MODELS_BY_MAKE } from '../data/boat-models.data';
import { BOAT_SPECIFICATIONS_SEED } from '../data/boat-specifications.data';

@Injectable()
export class BoatsSpecificationService implements OnModuleInit {
  private readonly logger = new Logger(BoatsSpecificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('[INIT] Boat Specifications Seeding Started');
    try {
      await this.seedSpecifications();
      await this.seedMakes();
      await this.seedModels();
      this.logger.log(
        '[DONE] Boat Specifications Seeding Completed Successfully',
      );
    } catch (error) {
      this.logger.error('[FAILED] Boat Specifications Seeding Failed:', error);
    }
  }

  private async seedSpecifications(): Promise<void> {
    for (const [type, items] of Object.entries(BOAT_SPECIFICATIONS_SEED) as [
      BoatSpecificationType,
      string[],
    ][]) {
      if (
        type === BoatSpecificationType.MAKE ||
        type === BoatSpecificationType.MODEL
      )
        continue;
      await this.seedByType(type, items);
    }
  }

  private async seedByType(
    type: BoatSpecificationType,
    items: string[],
  ): Promise<void> {
    if (!items?.length) return;

    this.logger.log(`[SEED] ${type} (${items.length} items)`);

    for (const rawName of items) {
      const name = rawName?.toString().trim();
      if (!name) continue;

      try {
        const existing = await this.prisma.client.boatSpecification.findFirst({
          where: { type, name },
        });

        if (existing) {
          // this.logger.log(`[EXIST] ${type} → "${name}" already exists`);
          continue;
        }

        await this.prisma.client.boatSpecification.create({
          data: {
            type,
            name,
            source: DataInsertSource.SYSTEM,
            isDeleted: false,
          },
        });

        this.logger.log(`[CREATED] ${type} → "${name}" inserted`);
      } catch (error) {
        this.logger.error(
          `[ERROR] Failed to create ${type} → "${name}": ${(error as any)?.message ?? error}`,
        );
      }
    }

    this.logger.log(`[COMPLETE] ${type} seeding done`);
  }

  /** Seed all MAKES */
  private async seedMakes(): Promise<void> {
    this.logger.log(`[SEED] MAKE (${BOAT_MAKES_WITH_CODE.length} items)`);

    for (const make of BOAT_MAKES_WITH_CODE) {
      const name = make.name.trim();
      if (!name) continue;

      try {
        const existing = await this.prisma.client.boatSpecification.findFirst({
          where: { type: BoatSpecificationType.MAKE, name },
        });

        if (existing) {
          // this.logger.log(`[EXIST] MAKE → "${name}" already exists`);
          continue;
        }

        await this.prisma.client.boatSpecification.create({
          data: {
            type: BoatSpecificationType.MAKE,
            name,
            source: DataInsertSource.SYSTEM,
            isDeleted: false,
            meta: make,
          },
        });

        this.logger.log(`[CREATED] MAKE → "${name}" inserted`);
      } catch (error) {
        this.logger.error(
          `[ERROR] Failed to create MAKE → "${name}": ${(error as any)?.message ?? error}`,
        );
      }
    }

    this.logger.log(`[COMPLETE] MAKE seeding done`);
  }

  /** Seed all MODELS per MAKE */
  private async seedModels(): Promise<void> {
    for (const [make, models] of Object.entries(BOAT_MODELS_BY_MAKE)) {
      this.logger.log(
        `[SEED] MODEL for MAKE → "${make}" (${models.length} items)`,
      );

      for (const rawName of models) {
        const name = rawName?.toString().trim();
        if (!name) continue;

        try {
          const existing = await this.prisma.client.boatSpecification.findFirst(
            {
              where: { type: BoatSpecificationType.MODEL, name },
            },
          );

          if (existing) {
            // this.logger.log(`[EXIST] MODEL → "${name}" already exists`);
            continue;
          }

          await this.prisma.client.boatSpecification.create({
            data: {
              type: BoatSpecificationType.MODEL,
              name,
              source: DataInsertSource.SYSTEM,
              isDeleted: false,
              meta: { make },
            },
          });

          this.logger.log(`[CREATED] MODEL → "${name}" inserted`);
        } catch (error) {
          this.logger.error(
            `[ERROR] Failed to create MODEL → "${name}": ${(error as any)?.message ?? error}`,
          );
        }
      }

      this.logger.log(`[COMPLETE] MODEL seeding for MAKE → "${make}" done`);
    }
  }
}
