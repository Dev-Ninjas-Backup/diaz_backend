import { PaginationDto } from '@/common/dto/pagination.dto';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetAllBoatsCustomDto } from '../dto/get-all-boats-custom.dto';
import {
  GetBoatsDto,
  GetMergedBoatsDto,
  GetSingleBoatDto,
} from '../dto/get-boats.dto';
import { GetAllBoatsMergedService } from '../services/get-all-boats-merged.service';
import { GetAllBoatsService } from '../services/get-all-boats.service';
import { GetAllCustomBoatsFloridaService } from '../services/get-all-custom-boats-florida.service';
import { GetCustomBoatsService } from '../services/get-custom-boats.service';
import { GetFilterOptionsService } from '../services/get-filter-options.service';
import { PremiumDealsFloridaService } from '../services/premium-deals-florida.service';

@ApiTags('Shared -- Boats')
@Controller('boats')
export class BoatsController {
  constructor(
    private readonly getCustomBoatsService: GetCustomBoatsService,
    private readonly getAllBoatsService: GetAllBoatsService,
    private readonly getAllBoatsMergedService: GetAllBoatsMergedService,
    private readonly getAllCustomBoatsService: GetAllCustomBoatsFloridaService,
    private readonly premiumDealsFloridaService: PremiumDealsFloridaService,
    private readonly getFilterOptionsService: GetFilterOptionsService,
  ) {}

  @ApiOperation({ summary: 'Get all custom boats' })
  @Get()
  async getAllBoats(@Query() query: GetAllBoatsCustomDto) {
    return this.getAllCustomBoatsService.getAllBoats(query);
  }

  @ApiOperation({
    summary:
      'Get available filter options (makes, models, years, cities, states, classes)',
  })
  @Get('filter-options')
  async getFilterOptions() {
    return this.getFilterOptionsService.getFilterOptions();
  }

  @ApiOperation({ summary: 'Get single custom boat details' })
  @Get(':boatId/details')
  async getSingleBoatDetails(@Param('boatId') boatId: string) {
    return this.getCustomBoatsService.getSingleBoat(boatId);
  }

  @ApiOperation({ summary: 'Get all boats from all sources' })
  @Get('all')
  async getBoats(@Query() query: GetBoatsDto) {
    return this.getAllBoatsService.getBoats(query);
  }

  @ApiOperation({ summary: 'Get single boat from all sources' })
  @Get(':boatId/all')
  async getSingleBoat(
    @Param('boatId') boatId: string,
    @Query() query: GetSingleBoatDto,
  ) {
    return this.getAllBoatsService.getSingleBoat(boatId, query);
  }

  @ApiOperation({ summary: 'Get single boat from all sources' })
  @Get(':boatId/transform')
  async getSingleBoatTransform(
    @Param('boatId') boatId: string,
    @Query() query: GetSingleBoatDto,
  ) {
    return this.getAllBoatsService.getSingleBoatTransform(boatId, query);
  }

  @ApiOperation({ summary: 'Get all merged boats from all sources' })
  @Get('merged/all-sources')
  async getMergedBoats(@Query() query: GetMergedBoatsDto) {
    return this.getAllBoatsMergedService.getMergedBoats(query);
  }

  @ApiOperation({ summary: 'Get premium deals near Florida' })
  @Get('premium-deals/florida')
  async getPremiumDealsNearFlorida(@Query() query: PaginationDto) {
    return this.premiumDealsFloridaService.getPremiumDealsNearFlorida(query);
  }
}
