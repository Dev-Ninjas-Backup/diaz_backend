import { QueueName } from '@/common/enum/queue-name.enum';
import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { SyncBoatsWithGmcCronService } from './cron/sync-boats-with-gmc-cron.service';
import { QueueGateway } from './queue.gateway';
import { AdoptBoatsDataEventsService } from './services/adopt-boats-data-events.service';
import { ImageProcessingEventsService } from './services/image-processing-events.service';
import { SyncBoatsWitGmcEventsService } from './services/sync-boats-with-gmc-events.service';
import { AdoptBoatsFeaturesService } from './worker/adopt-boats-features.service';
import { AdoptBoatsSpecificationsService } from './worker/adopt-boats-specifications.service';
import { ImageDeletingService } from './worker/image-deleting.service';
import { ImageProcessingService } from './worker/image-processing.service';
import { SyncBoatsWithGmcService } from './worker/sync-boats-with-gmc.service';

@Global()
@Module({
  imports: [
    BullModule.registerQueue(
      { name: QueueName.NOTIFICATION },
      { name: QueueName.IMAGE_PROCESSING },
      { name: QueueName.IMAGE_DELETING },
      { name: QueueName.ADOPT_BOATS_SPECIFICATIONS },
      { name: QueueName.ADOPT_BOATS_FEATURES },
      { name: QueueName.SYNC_BOATS_WITH_GMC },
    ),
  ],
  providers: [
    QueueGateway,
    ImageProcessingEventsService,
    ImageProcessingService,
    ImageDeletingService,
    AdoptBoatsDataEventsService,
    AdoptBoatsFeaturesService,
    AdoptBoatsSpecificationsService,
    SyncBoatsWithGmcCronService,
    SyncBoatsWitGmcEventsService,
    SyncBoatsWithGmcService,
  ],
  exports: [BullModule],
})
export class QueueModule {}
