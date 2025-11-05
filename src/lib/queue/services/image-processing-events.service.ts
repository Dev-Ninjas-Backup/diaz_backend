import { QueueEventsEnum } from '@/common/enum/queue-events.enum';
import { QueueName } from '@/common/enum/queue-name.enum';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';

@Injectable()
export class ImageProcessingEventsService {
  private readonly logger = new Logger(ImageProcessingEventsService.name);

  constructor(
    @InjectQueue(QueueName.IMAGE_PROCESSING)
    private readonly queue: Queue,
  ) {}

  @OnEvent(QueueEventsEnum.COVER_IMAGE_PROCESSING)
  async handleCoverImageProcessing(payload: any) {
    this.logger.log(
      `Enqueuing cover image processed event for Listing: ${payload.listingId}`,
    );

    try {
      await this.queue.add(QueueEventsEnum.COVER_IMAGE_PROCESSING, payload, {
        // * Automatically remove job when completed
        removeOnComplete: true,

        // * Automatically remove job if it fails after all attempts
        removeOnFail: { count: 5 },

        // * Retry job 5 times
        attempts: 3,

        // * Exponential backoff strategy with initial delay of 1 second
        backoff: { type: 'exponential', delay: 1000 },

        // * Set unique job ID to prevent duplicate jobs for the same listing
        jobId: `${QueueEventsEnum.COVER_IMAGE_PROCESSING}:${payload.listingId}`,
      });
      this.logger.log(
        `Successfully enqueued cover image processed event for Listing: ${payload.listingId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to enqueue cover image processed event for Listing: ${payload.listingId}`,
        error.stack,
      );
    }
  }

  @OnEvent(QueueEventsEnum.GALLERY_IMAGE_PROCESSING)
  async handleGalleryImageProcessing(payload: any) {
    this.logger.log(
      `Enqueuing gallery image processed event for Listing: ${payload.listingId}`,
    );

    try {
      await this.queue.add(QueueEventsEnum.GALLERY_IMAGE_PROCESSING, payload, {
        // * Automatically remove job when completed
        removeOnComplete: true,

        // * Automatically remove job if it fails after all attempts
        removeOnFail: { count: 5 },

        // * Retry job 5 times
        attempts: 3,

        // * Exponential backoff strategy with initial delay of 1 second
        backoff: { type: 'exponential', delay: 1000 },

        // * Set unique job ID to prevent duplicate jobs for the same listing
        jobId: `${QueueEventsEnum.GALLERY_IMAGE_PROCESSING}:${payload.listingId}`,
      });
      this.logger.log(
        `Successfully enqueued gallery image processed event for Listing: ${payload.listingId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to enqueue gallery image processed event for Listing: ${payload.listingId}`,
        error.stack,
      );
    }
  }
}
