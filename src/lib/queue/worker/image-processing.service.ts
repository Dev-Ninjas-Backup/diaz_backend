import { QueueEventsEnum } from '@/common/enum/queue-events.enum';
import { QueueName } from '@/common/enum/queue-name.enum';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { S3Service } from '@/lib/s3/s3.service';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { BoatImageType } from 'generated/client';
import {
  ListingImageProcessPayload,
  QueueFile,
} from '../interface/image-process.payload';
import { NotificationPayload } from '../interface/queue.payload';
import { QueueGateway } from '../queue.gateway';

@Processor(QueueName.IMAGE_PROCESSING, { concurrency: 5 })
export class ImageProcessingService extends WorkerHost {
  private readonly logger = new Logger(ImageProcessingService.name);

  constructor(
    private readonly gateway: QueueGateway,
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {
    super();
  }

  async process(job: Job<ListingImageProcessPayload>): Promise<void> {
    const payload = job.data;
    const listingId = payload.listingId;

    this.logger.log(
      `Start processing job ${job.id} for listing ${listingId}, total files=${payload.files?.length}`,
    );

    const files: QueueFile[] = payload.files;

    if (!files || files.length === 0) {
      const msg = `Job ${job.id} contains no files to process for listing ${listingId}`;
      this.logger.warn(msg);
      throw new Error(msg);
    }

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageType =
          file.type === 'COVER' ? BoatImageType.COVER : BoatImageType.GALLERY;

        this.logger.log(
          `Uploading file ${i + 1} of ${files.length} (${file.type}) for job ${job.id}, listing ${listingId}`,
        );

        let uploadResult;
        try {
          uploadResult = await this.s3.uploadFileByPath(file.path);
        } catch (error) {
          this.logger.error(
            `Failed to upload file ${file.originalName} for job ${job.id}, listing ${listingId}: ${
              (error as Error).message
            }`,
            (error as Error).stack,
          );
          throw error;
        }

        await this.prisma.client.boatImage.create({
          data: {
            boatId: listingId,
            imageType,
            fileId: uploadResult.id,
          },
        });

        this.logger.log(
          `Successfully processed file ${file.originalName} (${file.type}) for job ${job.id}, listing ${listingId}`,
        );
      }

      this.logger.log(
        `Completed processing job ${job.id} for listing ${listingId}`,
      );

      const notificationPayload: NotificationPayload = {
        title: 'Image Processing',
        message: 'All images processed successfully',
        createdAt: new Date(),
        type: QueueEventsEnum.NOTIFICATION,
        meta: {
          performedBy: payload.userId,
          recordId: listingId,
          recordType: 'Boats',
        },
      };

      // Notify via WebSocket
      this.gateway.notifySingleUser(
        payload.userId,
        QueueEventsEnum.NOTIFICATION,
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
