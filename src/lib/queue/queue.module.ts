import { QueueName } from '@/common/enum/queue-name.enum';
import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { QueueGateway } from './queue.gateway';

@Global()
@Module({
  imports: [
    BullModule.registerQueue(
      { name: QueueName.NOTIFICATION },
      { name: QueueName.IMAGE_PROCESSING },
    ),
  ],
  providers: [QueueGateway],
  exports: [BullModule],
})
export class QueueModule {}
