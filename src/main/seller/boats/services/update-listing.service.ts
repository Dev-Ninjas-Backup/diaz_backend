import { ParseJsonPipe } from '@/common/pipe/parse-json.pipe';
import { PrismaService } from '@/lib/prisma/prisma.service';
import { QueueFile } from '@/lib/queue/interface/image-process.payload';
import { Injectable, Logger } from '@nestjs/common';
import { UpdateListingDtoWithImagesDto } from '../dto/update-boats.dto';

@Injectable()
export class UpdateListingService {
  private readonly logger = new Logger(UpdateListingService.name);
  private readonly parsePipe = new ParseJsonPipe();
  constructor(private readonly prisma: PrismaService) {}

  async updateListing(
    boatId: string,
    data: UpdateListingDtoWithImagesDto,
    files: QueueFile[],
  ) {
    const boatInfo = this.parsePipe.transform(data);

    this.logger.log(
      `[UPDATE LISTING] boatId: ${boatId}. boatInfo: ${boatInfo} FILES: ${files.length}`,
    );
    this.logger.log(JSON.stringify(boatInfo, null, 2));
  }
}
