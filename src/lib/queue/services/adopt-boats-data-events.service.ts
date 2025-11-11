import { QueueEventsEnum } from '@/common/enum/queue-events.enum';
import { QueueName } from '@/common/enum/queue-name.enum';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';
import {
  AdoptBoatsFeatures,
  AdoptBoatsSpecification,
} from '../interface/adopt-boats-data.payload';
import { enqueueJobHelper } from '../utils/queue.utils';

@Injectable()
export class AdoptBoatsDataEventsService {
  private readonly logger = new Logger(AdoptBoatsDataEventsService.name);

  constructor(
    @InjectQueue(QueueName.ADOPT_BOATS_FEATURES)
    private readonly featureQueue: Queue,
    @InjectQueue(QueueName.ADOPT_BOATS_SPECIFICATIONS)
    private readonly specificationQueue: Queue,
  ) {}

  @OnEvent(QueueEventsEnum.ADOPT_BOATS_FEATURES)
  async handleAdoptBoatsFeatures(payload: AdoptBoatsFeatures) {
    await enqueueJobHelper(
      this.featureQueue,
      QueueEventsEnum.ADOPT_BOATS_FEATURES,
      payload,
      payload.listingId,
      this.logger,
    );
  }

  @OnEvent(QueueEventsEnum.ADOPT_BOATS_SPECIFICATION)
  async handleAdoptBoatsSpecification(payload: AdoptBoatsSpecification) {
    await enqueueJobHelper(
      this.specificationQueue,
      QueueEventsEnum.ADOPT_BOATS_SPECIFICATION,
      payload,
      payload.listingId,
      this.logger,
    );
  }
}
