import { QueueName } from '@/common/enum/queue-name.enum';
import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { QueueGateway } from './queue.gateway';
import { ImageProcessingEventsService } from './services/image-processing-events.service';
import { ImageProcessingService } from './worker/image-processing.service';

@Global()
@Module({
  imports: [
    BullModule.registerQueue(
      { name: QueueName.NOTIFICATION },
      { name: QueueName.IMAGE_PROCESSING },
      { name: QueueName.ADOPT_BOATS_SPECIFICATION },
    ),
  ],
  providers: [
    QueueGateway,
    ImageProcessingEventsService,
    ImageProcessingService,
  ],
  exports: [BullModule],
})
export class QueueModule {}
