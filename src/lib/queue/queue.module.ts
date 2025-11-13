import { QueueName } from '@/common/enum/queue-name.enum';
import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { QueueGateway } from './queue.gateway';
import { AdoptBoatsDataEventsService } from './services/adopt-boats-data-events.service';
import { ImageProcessingEventsService } from './services/image-processing-events.service';
import { AdoptBoatsFeaturesService } from './worker/adopt-boats-features.service';
import { AdoptBoatsSpecificationsService } from './worker/adopt-boats-specifications.service';
import { ImageDeletingService } from './worker/image-deleting.service';
import { ImageProcessingService } from './worker/image-processing.service';

@Global()
@Module({
  imports: [
    BullModule.registerQueue(
      { name: QueueName.NOTIFICATION },
      { name: QueueName.IMAGE_PROCESSING },
      { name: QueueName.IMAGE_DELETING },
      { name: QueueName.ADOPT_BOATS_SPECIFICATIONS },
      { name: QueueName.ADOPT_BOATS_FEATURES },
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
  ],
  exports: [BullModule],
})
export class QueueModule {}
