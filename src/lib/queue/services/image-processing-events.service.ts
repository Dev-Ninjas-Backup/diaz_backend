import { QueueEventsEnum } from '@/common/enum/queue-events.enum';
import { QueueName } from '@/common/enum/queue-name.enum';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';
import { ListingImageProcessPayload } from '../interface/image-process.payload';
import { enqueueJobHelper } from '../utils/queue.utils';

@Injectable()
export class ImageProcessingEventsService {
  private readonly logger = new Logger(ImageProcessingEventsService.name);

  constructor(
    @InjectQueue(QueueName.IMAGE_PROCESSING)
    private readonly queue: Queue,
  ) {}

  @OnEvent(QueueEventsEnum.COVER_IMAGE_PROCESSING)
  async handleCoverImageProcessing(payload: ListingImageProcessPayload) {
    await enqueueJobHelper(
      this.queue,
      QueueEventsEnum.COVER_IMAGE_PROCESSING,
      payload,
      payload.listingId,
      this.logger,
    );
  }

  @OnEvent(QueueEventsEnum.GALLERY_IMAGE_PROCESSING)
  async handleGalleryImageProcessing(payload: ListingImageProcessPayload) {
    await enqueueJobHelper(
      this.queue,
      QueueEventsEnum.GALLERY_IMAGE_PROCESSING,
      payload,
      payload.listingId,
      this.logger,
    );
  }
}
