import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ManualRotateFeaturedYachtDto } from './dto/manual-rotate-featured-yacht.dto';
import { BoatsService } from './services/boats.service';

@ApiTags('Admin -- Boats')
@Controller('admin/boats')
export class BoatsController {
  constructor(private readonly boatsService: BoatsService) {}

  @ApiOperation({
    summary: 'Manually trigger featured yacht rotation',
    description:
      'Manually rotate featured yacht for a specific site or all sites. Useful for initialization or forcing a rotation.',
  })
  @Post('featured/rotate')
  async manualRotateFeaturedYacht(@Body() dto: ManualRotateFeaturedYachtDto) {
    return this.boatsService.manualRotateFeaturedYacht(dto);
  }
}
