import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TopViewedBoatsService } from '../services/top-viewed-boats.service';

@ApiTags('Shared -- Boats')
@Controller('boats')
export class TopViewedBoatsController {
  constructor(private readonly topViewedBoatsService: TopViewedBoatsService) {}

  @ApiOperation({ summary: 'Get Top Viewed Boats' })
  @Get('top-viewed')
  async getTopViewedBoats() {
    return this.topViewedBoatsService.getTopViewedBoats();
  }
}
