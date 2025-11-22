import { QueueEventsEnum } from '@/common/enum/queue-events.enum';
import { QueueName } from '@/common/enum/queue-name.enum';
import { GoogleContentService } from '@/lib/googleapis/services/google-content.service';
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
    private readonly googleContent: GoogleContentService,
  ) {
    super();
  }

  async process(job: Job<SyncBoatsWithGmcPayload>): Promise<void> {
    const listingId = job.data.listingId;

    this.logger.log(
      `[GMC Worker] Start processing job: ${job.id}, listing: ${listingId}`,
    );

    try {
      // Sync Product with GMC
      const gmcResponse = await this.googleContent.syncBoatWithGmc(listingId);

      // Notify admins
      const notificationPayload: NotificationPayload = {
        title: 'Boat Synced with Google Merchant',
        message: `Boat listing ${listingId} synced successfully.`,
        createdAt: new Date(),
        type: QueueEventsEnum.NOTIFICATION,
        meta: {
          performedBy: 'System',
          recordId: listingId,
          recordType: 'Boats',
          others: { gmcResponse },
        },
      };

      await this.gateway.emitToAdmins(
        QueueEventsEnum.NOTIFICATION,
        notificationPayload,
      );
    } catch (err) {
      this.logger.error(
        `[GMC Worker] Failed to process job ${job.id} for listing ${listingId}: ${(err as Error).message}`,
        (err as Error).stack,
      );
      // rethrow so BullMQ handles retry/backoff according to your queue config
      throw err;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`[GMC Worker] Job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: any) {
    this.logger.error(`[GMC Worker] Job ${job.id} failed: ${err?.message}`);
  }
}
