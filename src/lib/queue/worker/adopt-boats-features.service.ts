import { QueueName } from '@/common/enum/queue-name.enum';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  AdoptBoatsFeatures,
  AdoptBoatsSpecification,
} from '../interface/adopt-boats-data.payload';
import { QueueGateway } from '../queue.gateway';

@Processor(QueueName.ADOPT_BOATS_FEATURES, { concurrency: 5 })
export class AdoptBoatsFeaturesService extends WorkerHost {
  private readonly logger = new Logger(AdoptBoatsFeaturesService.name);

  constructor(
    private readonly gateway: QueueGateway,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<AdoptBoatsSpecification | AdoptBoatsFeatures>) {
    this.logger.log(`Processing job Features ${job.id}`);
    this.logger.log(job.data);

    this.logger.log(`Job ${job.id} completed`);
  }
}
