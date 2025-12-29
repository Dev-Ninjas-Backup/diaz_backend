import { HandleError } from '@/common/error/handle-error.decorator';
import { successResponse, TResponse } from '@/common/utils/response.util';
import { FeaturedYachtCronService } from '@/lib/queue/cron/featured-yacht-cron.service';
import { Injectable, Logger } from '@nestjs/common';
import { SiteType } from 'generated/enums';
import { ManualRotateFeaturedYachtDto } from '../dto/manual-rotate-featured-yacht.dto';

@Injectable()
export class BoatsService {
  private readonly logger = new Logger(BoatsService.name);

  constructor(
    private readonly featuredYachtCronService: FeaturedYachtCronService,
  ) {}

  @HandleError('Failed to manually rotate featured yacht')
  async manualRotateFeaturedYacht(
    dto: ManualRotateFeaturedYachtDto,
  ): Promise<TResponse<any>> {
    const { site } = dto;

    if (site) {
      // Rotate for specific site
      this.logger.log(`Manually rotating featured yacht for ${site}`);
      await this.featuredYachtCronService.rotateFeaturedYacht(site);
      return successResponse(
        { site, rotated: true },
        `Featured yacht rotated successfully for ${site}`,
      );
    } else {
      // Rotate for all sites
      this.logger.log('Manually rotating featured yacht for all sites');
      await this.featuredYachtCronService.rotateFeaturedYacht(SiteType.FLORIDA);
      await this.featuredYachtCronService.rotateFeaturedYacht(SiteType.JUPITER);
      return successResponse(
        { sites: [SiteType.FLORIDA, SiteType.JUPITER], rotated: true },
        'Featured yacht rotated successfully for all sites',
      );
    }
  }
}
