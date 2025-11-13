import { QueueEventsEnum } from '@/common/enum/queue-events.enum';
import { QueueName } from '@/common/enum/queue-name.enum';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';
import {
  ListingImageDeletePayload,
  ListingImageProcessPayload,
} from '../interface/image-process.payload';
import { enqueueJobHelper } from '../utils/queue.utils';

@Injectable()
export class ImageProcessingEventsService {
  private readonly logger = new Logger(ImageProcessingEventsService.name);

  constructor(
    @InjectQueue(QueueName.IMAGE_PROCESSING)
    private readonly imageProcessingQueue: Queue,
    @InjectQueue(QueueName.IMAGE_DELETING)
    private readonly imageDeletingQueue: Queue,
  ) {}

  @OnEvent(QueueEventsEnum.LISTING_IMAGE_PROCESSING)
  async handleListingImageProcessing(payload: ListingImageProcessPayload) {
    await enqueueJobHelper(
      this.imageProcessingQueue,
      QueueEventsEnum.LISTING_IMAGE_PROCESSING,
      payload,
      payload.listingId,
      this.logger,
    );
  }

  @OnEvent(QueueEventsEnum.LISTING_IMAGE_DELETING)
  async handleListingImageDelete(payload: ListingImageDeletePayload) {
    await enqueueJobHelper(
      this.imageDeletingQueue,
      QueueEventsEnum.LISTING_IMAGE_DELETING,
      payload,
      payload.listingId,
      this.logger,
    );
  }
}
