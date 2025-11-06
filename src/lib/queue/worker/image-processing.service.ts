import { QueueName } from '@/common/enum/queue-name.enum';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ListingImageProcessPayload } from '../interface/image-process.payload';
import { QueueGateway } from '../queue.gateway';

@Processor(QueueName.IMAGE_PROCESSING, { concurrency: 5 })
export class ImageProcessingService extends WorkerHost {
  private readonly logger = new Logger(ImageProcessingService.name);

  constructor(
    private readonly gateway: QueueGateway,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<ListingImageProcessPayload>): Promise<void> {
    const payload = job.data;
    this.logger.log(`Processing job for Listing ${payload.listingId}`);

    try {
      this.logger.log(`Job ${job.id} processed successfully.`);
    } catch (err) {
      this.logger.error(
        `Failed to process job ${job.id}: ${err?.message}`,
        err?.stack,
      );
      throw err; // let BullMQ retry/backoff handle it
    }
  }

  // Optional job lifecycle events
  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: any) {
    this.logger.error(`Job ${job.id} failed: ${err?.message}`);
  }
}
