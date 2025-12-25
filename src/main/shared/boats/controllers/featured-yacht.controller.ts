import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  GetFeaturedYachtDto,
  GetFeaturedYachtHistoryDto,
} from '../dto/get-featured-yacht.dto';
import { FeaturedYachtService } from '../services/featured-yacht.service';

@ApiTags('Shared -- Featured Yacht')
@Controller('boats/featured')
export class FeaturedYachtController {
  constructor(private readonly featuredYachtService: FeaturedYachtService) {}

  @ApiOperation({
    summary: 'Get current featured yacht',
    description: 'Returns the currently featured yacht for a specific site',
  })
  @ApiQuery({
    name: 'site',
    enum: ['FLORIDA', 'JUPITER'],
    required: true,
    description: 'Site to get featured yacht for',
  })
  @Get()
  async getCurrentFeaturedYacht(@Query() query: GetFeaturedYachtDto) {
    return this.featuredYachtService.getCurrentFeaturedYacht(query.site);
  }

  @ApiOperation({
    summary: 'Get featured yacht history',
    description: 'Returns the history of featured yachts (optional)',
  })
  @ApiQuery({
    name: 'site',
    enum: ['FLORIDA', 'JUPITER'],
    required: false,
    description: 'Filter by site (optional)',
  })
  @Get('history')
  async getFeaturedYachtHistory(@Query() query: GetFeaturedYachtHistoryDto) {
    return this.featuredYachtService.getFeaturedYachtHistory(query.site);
  }
}
