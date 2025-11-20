import { QueueEventsEnum } from '@/common/enum/queue-events.enum';
import { QueueName } from '@/common/enum/queue-name.enum';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NotificationPayload } from '../interface/queue.payload';
import { SyncBoatsWithGmcPayload } from '../interface/sync-boats-with-gmc.payload';
import { QueueGateway } from '../queue.gateway';

@Processor(QueueName.SYNC_BOATS_WITH_GMC, { concurrency: 5 })
export class SyncBoatsWithGmcService extends WorkerHost {
  private readonly logger = new Logger(SyncBoatsWithGmcService.name);

  constructor(
    private readonly gateway: QueueGateway,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<SyncBoatsWithGmcPayload>): Promise<void> {
    const payload = job.data;
    const listingId = payload.listingId;

    this.logger.log(`Start processing job ${job.id} for listing ${listingId}`);

    try {
      this.logger.log(
        `Completed processing job ${job.id} for listing ${listingId}`,
      );

      const notificationPayload: NotificationPayload = {
        title: 'Sync Boat with GMC',
        message: `Sync Boat with GMC completed successfully for listing ${listingId}`,
        createdAt: new Date(),
        type: QueueEventsEnum.NOTIFICATION,
        meta: {
          performedBy: 'System',
          recordId: listingId,
          recordType: 'Boats',
        },
      };

      // TODO: Notify all admins
      this.logger.log(
        `Sending notification for job ${job.id} for listing ${listingId}`,
        notificationPayload,
      );
    } catch (err) {
      this.logger.error(
        `Failed to process job ${job.id} for listing ${listingId}: ${(err as Error).message}`,
        (err as Error).stack,
      );
      // rethrow so BullMQ handles retry/backoff according to your queue config
      throw err;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: any) {
    this.logger.error(`Job ${job.id} failed: ${err?.message}`);
  }
}
