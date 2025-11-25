import { QueueName } from '@/common/enum/queue-name.enum';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { S3Service } from '@/lib/s3/s3.service';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ListingImageDeletePayload } from '../interface/image-process.payload';

@Processor(QueueName.IMAGE_DELETING, { concurrency: 5 })
export class ImageDeletingService extends WorkerHost {
  private readonly logger = new Logger(ImageDeletingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {
    super();
  }

  async process(job: Job<ListingImageDeletePayload>): Promise<void> {
    const payload = job.data;
    const listingId = payload.listingId;
    const imagesToDelete = payload.imagesToDelete;

    this.logger.log(
      `Start processing job ${job.id} for listing ${listingId}, total images=${imagesToDelete.length}`,
    );

    if (!imagesToDelete || imagesToDelete.length === 0) {
      this.logger.log(`No images to delete for job ${job.id}`);
      return;
    }

    try {
      // Fetch boat images with their associated file instances
      const boatImages = await this.prisma.client.boatImage.findMany({
        where: {
          boatId: listingId,
          id: { in: imagesToDelete },
        },
        include: {
          file: true,
        },
      });

      if (!boatImages || boatImages.length === 0) {
        this.logger.warn(
          `No matching images found for job ${job.id}, listing ${listingId}`,
        );
        return;
      }

      this.logger.log(
        `Found ${boatImages.length} images to delete for job ${job.id}`,
      );

      // Extract file IDs for S3 deletion
      const fileIds = boatImages.map((img) => img.fileId);

      // Delete from database first (cascade will handle BoatImage records)
      await this.prisma.client.boatImage.deleteMany({
        where: { id: { in: boatImages.map((img) => img.id) } },
      });

      this.logger.log(
        `Deleted ${boatImages.length} boat image records for job ${job.id}`,
      );

      // Delete files from S3 and database using the S3 service
      await this.s3.deleteFiles(fileIds);

      this.logger.log(
        `Deleted ${fileIds.length} files from S3 and database for job ${job.id}`,
      );

      this.logger.log(
        `Completed processing job ${job.id} for listing ${listingId}`,
      );
    } catch (err) {
      this.logger.error(
        `Failed to process job ${job.id} for listing ${listingId}: ${(err as Error).message}`,
        (err as Error).stack,
      );
      // Rethrow so BullMQ handles retry/backoff according to your queue config
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
