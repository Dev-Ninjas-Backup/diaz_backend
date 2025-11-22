import { QueueEventsEnum } from '@/common/enum/queue-events.enum';
import { QueueName } from '@/common/enum/queue-name.enum';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';
import { SyncBoatsWithGmcPayload } from '../interface/sync-boats-with-gmc.payload';
import { enqueueJobHelper } from '../utils/queue.utils';

@Injectable()
export class SyncBoatsWitGmcEventsService {
  private readonly logger = new Logger(SyncBoatsWitGmcEventsService.name);

  constructor(
    @InjectQueue(QueueName.SYNC_BOATS_WITH_GMC)
    private readonly syncBoatsQueue: Queue,
  ) {}

  @OnEvent(QueueEventsEnum.SYNC_BOATS_WITH_GMC)
  async handleSyncBoatsWithGmc(payload: SyncBoatsWithGmcPayload) {
    await enqueueJobHelper(
      this.syncBoatsQueue,
      QueueEventsEnum.ADOPT_BOATS_SPECIFICATION,
      payload,
      payload.listingId,
      this.logger,
    );
  }
}
