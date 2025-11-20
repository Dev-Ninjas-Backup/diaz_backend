import { QueueEventsEnum } from '@/common/enum/queue-events.enum';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SyncBoatsWithGmcPayload } from '../interface/sync-boats-with-gmc.payload';

@Injectable()
export class SyncBoatsWithGmcCronService {
  private readonly logger = new Logger(SyncBoatsWithGmcCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async syncAllBoats() {
    const boats = await this.prisma.boats.findMany({
      include: { engines: true, images: { include: { file: true } } },
    });

    for (const boat of boats) {
      try {
        const payload: SyncBoatsWithGmcPayload = {
          listingId: boat.id,
          listing: boat,
        };

        // Emit asynchronously to avoid blocking event loop
        await this.eventEmitter.emitAsync(
          QueueEventsEnum.SYNC_BOATS_WITH_GMC,
          payload,
        );
      } catch (err) {
        this.logger.error(`Failed to sync boat ${boat.id}`, err);
      }
    }
  }

  // @Cron(CronExpression.EVERY_DAY_AT_1AM, {
  //   timeZone: 'America/New_York',
  // })
  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleAmericaMorningCron() {
    await this.syncAllBoats();
  }
}
