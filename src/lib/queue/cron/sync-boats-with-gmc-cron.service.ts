import { QueueEventsEnum } from '@/common/enum/queue-events.enum';
import { GoogleContentService } from '@/lib/googleapis/services/google-content.service';
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
    private readonly googleContent: GoogleContentService,
  ) {}

  async syncAllBoats() {
    // Only sync active listings — inactive/sold/draft boats cause "Vessel Not Found" in GMC
    const boats = await this.prisma.client.boats.findMany({
      where: { status: 'ACTIVE' },
      include: { engines: true, images: { include: { file: true } } },
    });

    this.logger.log(`Syncing ${boats.length} active boats with GMC`);

    for (const boat of boats) {
      try {
        const payload: SyncBoatsWithGmcPayload = {
          listingId: boat.id,
          listing: boat,
        };

        await this.eventEmitter.emitAsync(
          QueueEventsEnum.SYNC_BOATS_WITH_GMC,
          payload,
        );
      } catch (err) {
        this.logger.error(`Failed to sync boat ${boat.id}`, err);
      }
    }

    // After syncing all products, request an account-level GMC review
    // so disapproved listings get re-evaluated with the updated data
    await this.googleContent.requestAccountReview();
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM, {
    timeZone: 'America/New_York',
  })
  // @Cron(CronExpression.EVERY_10_SECONDS)
  async handleAmericaMorningCron() {
    await this.syncAllBoats();
  }
}
