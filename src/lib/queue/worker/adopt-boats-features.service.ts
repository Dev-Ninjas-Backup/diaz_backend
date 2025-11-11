import { QueueName } from '@/common/enum/queue-name.enum';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { BoatFeatureType } from '@prisma/client';
import { Job } from 'bullmq';
import { AdoptBoatsFeatures } from '../interface/adopt-boats-data.payload';

@Processor(QueueName.ADOPT_BOATS_FEATURES, { concurrency: 5 })
export class AdoptBoatsFeaturesService extends WorkerHost {
  private readonly logger = new Logger(AdoptBoatsFeaturesService.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<AdoptBoatsFeatures>) {
    this.logger.log(`[NEW JOB] Processing Features job ${job.id}`);
    const data = job.data;

    const featTypes: (keyof AdoptBoatsFeatures)[] = [
      'additionalEquipment',
      'covers',
      'electricalEquipment',
      'electronics',
      'insideEquipment',
      'outsideEquipment',
    ];

    for (const key of featTypes) {
      const type = this.getFeatureType(key);
      const items = data[key];
      if (!items?.length) continue;

      this.logger.log(`[SEED] Feature Type → ${type} (${items.length} items)`);

      for (const item of items) {
        const name = item?.toString().trim();
        if (!name) continue;

        try {
          const existing = await this.prisma.boatFeature.findFirst({
            where: { type, name },
          });

          if (existing) {
            this.logger.log(`[EXIST] ${type} → "${name}" already exists`);
            continue;
          }

          await this.prisma.boatFeature.create({
            data: {
              type,
              name,
              source: 'USER',
              isDeleted: false,
              meta: { listingId: data.listingId },
            },
          });

          this.logger.log(`[CREATED] ${type} → "${name}" inserted`);
        } catch (error) {
          this.logger.error(
            `[ERROR] Failed to create ${type} → "${name}": ${
              (error as any)?.message ?? error
            }`,
          );
        }
      }

      this.logger.log(`[COMPLETE] ${type} seeding done`);
    }

    this.logger.log(`[DONE] Features job ${job.id} completed`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: any) {
    this.logger.error(`Job ${job.id} failed: ${err?.message}`);
  }

  private getFeatureType(key: keyof AdoptBoatsFeatures) {
    switch (key) {
      case 'electronics':
        return BoatFeatureType.ELECTRONICS;
      case 'insideEquipment':
        return BoatFeatureType.INSIDE_EQUIPMENT;
      case 'outsideEquipment':
        return BoatFeatureType.OUTSIDE_EQUIPMENT;
      case 'electricalEquipment':
        return BoatFeatureType.ELECTRICAL_EQUIPMENT;
      case 'covers':
        return BoatFeatureType.COVERS;
      case 'additionalEquipment':
        return BoatFeatureType.ADDITIONAL_EQUIPMENT;
      default:
        return BoatFeatureType.ADDITIONAL_EQUIPMENT;
    }
  }
}
