import { QueueName } from '@/common/enum/queue-name.enum';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { BoatSpecificationType, DataInsertSource } from 'generated/client';
import { AdoptBoatsSpecification } from '../interface/adopt-boats-data.payload';

@Processor(QueueName.ADOPT_BOATS_SPECIFICATIONS, { concurrency: 5 })
export class AdoptBoatsSpecificationsService extends WorkerHost {
  private readonly logger = new Logger(AdoptBoatsSpecificationsService.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<AdoptBoatsSpecification>) {
    this.logger.log(`[NEW JOB] Processing Boat Specifications ${job.id}`);
    const data = job.data;

    // Iterate over each specification type in payload
    const specTypes: (keyof AdoptBoatsSpecification)[] = [
      'make',
      'model',
      'fuelType',
      'class',
      'material',
      'condition',
      'engineType',
      'propType',
      'propMaterial',
    ];

    for (const key of specTypes) {
      const type = this.getSpecType(key);

      const value = data[key];
      if (!value) continue;

      try {
        const existing = await this.prisma.client.boatSpecification.findFirst({
          where: {
            type,
            name: value,
          },
        });

        if (existing) {
          // this.logger.log(
          //   `[EXIST] ${key.toUpperCase()} → "${value}" already exists`,
          // );
          continue;
        }

        await this.prisma.client.boatSpecification.create({
          data: {
            type,
            name: value,
            source: DataInsertSource.USER,
            isDeleted: false,
            meta: { listingId: data.listingId },
          },
        });

        this.logger.log(`[CREATED] ${key.toUpperCase()} → "${value}" inserted`);
      } catch (error) {
        this.logger.error(
          `[ERROR] Failed to create ${key.toUpperCase()} → "${value}": ${(error as any)?.message ?? error}`,
        );
      }
    }

    this.logger.log(`[DONE] Job ${job.id} processed successfully`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: any) {
    this.logger.error(`Job ${job.id} failed: ${err?.message}`);
  }

  private getSpecType(key: string): BoatSpecificationType {
    switch (key) {
      case 'make':
        return BoatSpecificationType.MAKE;
      case 'model':
        return BoatSpecificationType.MODEL;
      case 'fuelType':
        return BoatSpecificationType.FUEL_TYPE;
      case 'class':
        return BoatSpecificationType.CLASS;
      case 'material':
        return BoatSpecificationType.MATERIAL;
      case 'condition':
        return BoatSpecificationType.CONDITION;
      case 'engineType':
        return BoatSpecificationType.ENGINE_TYPE;
      case 'propType':
        return BoatSpecificationType.PROP_TYPE;
      case 'propMaterial':
        return BoatSpecificationType.PROP_MATERIAL;
      default:
        return BoatSpecificationType.MAKE;
    }
  }
}
