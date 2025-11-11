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

  @OnEvent(QueueEventsEnum.LISTING_IMAGE_PROCESSING)
  async handleListingImageProcessing(payload: ListingImageProcessPayload) {
    await enqueueJobHelper(
      this.queue,
      QueueEventsEnum.LISTING_IMAGE_PROCESSING,
      payload,
      payload.listingId,
      this.logger,
    );
  }
}
