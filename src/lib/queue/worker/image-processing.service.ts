import { QueueEventsEnum } from '@/common/enum/queue-events.enum';
import { QueueName } from '@/common/enum/queue-name.enum';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { S3Service } from '@/lib/s3/s3.service';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { BoatImageType } from '@prisma/client';
import { Job } from 'bullmq';
import { ListingImageProcessPayload } from '../interface/image-process.payload';
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
    const imageType = payload.imageType as BoatImageType;

    this.logger.log(
      `Start processing job ${job.id} for listing ${listingId}, type=${imageType}`,
    );

    const files = payload.imageFiles;

    if (!files || files.length === 0) {
      const msg = `Job ${job.id} contains no files to process for listing ${listingId}`;
      this.logger.warn(msg);
      // Throw so BullMQ marks failed and any retry/backoff can occur
      throw new Error(msg);
    }

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.logger.log(
          `Uploading file ${i + 1} of ${files.length} for job ${job.id}, listing ${listingId}`,
        );

        let uploadResult;

        // Upload to S3
        try {
          uploadResult = await this.s3.uploadFile(file);
        } catch (error) {
          this.logger.error(
            `Failed to upload file ${i + 1} of ${files.length} for job ${job.id}, listing ${listingId}: ${
              (error as Error).message
            }`,
            (error as Error).stack,
          );
          throw error;
        }

        // Save file record in DB
        await this.prisma.boatImage.create({
          data: {
            boatId: listingId,
            imageType: imageType,
            fileId: uploadResult.id,
          },
        });

        this.logger.log(
          `Successfully processed file ${i + 1} of ${files.length} for job ${job.id}, listing ${listingId}`,
        );
      }
      this.logger.log(
        `Completed processing job ${job.id} for listing ${listingId}`,
      );

      const notificationPayload: NotificationPayload = {
        title: 'Image Processing',
        message: 'Image processing completed successfully',
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
