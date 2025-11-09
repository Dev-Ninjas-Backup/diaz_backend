import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetAllBoatsCustomDto } from './dto/get-all-boats-custom.dto';
import { GetBoatsDto } from './dto/get-boats.dto';
import { GetAllBoatsService } from './services/get-all-boats.service';
import { GetBoatsService } from './services/get-boats.service';
import { GetSingleBoatService } from './services/get-single-boat.service';

@ApiTags('Shared -- Boats')
@Controller('boats')
export class BoatsController {
  constructor(
    private readonly getSingleBoatService: GetSingleBoatService,
    private readonly getBoatsService: GetBoatsService,
    private readonly getAllBoatsService: GetAllBoatsService,
  ) {}

  @ApiOperation({ summary: 'Get all custom boats' })
  @Get()
  async getAllBoats(@Query() query: GetAllBoatsCustomDto) {
    return this.getBoatsService.getAllBoats(query);
  }

  @ApiOperation({ summary: 'Get single custom boat details' })
  @Get(':boatId/details')
  async getSingleBoatDetails(@Param('boatId') boatId: string) {
    return this.getSingleBoatService.getSingleBoatDetails(boatId);
  }

  @ApiOperation({ summary: 'Get all boats from all sources' })
  @Get('all')
  async getBoats(@Query() query: GetBoatsDto) {
    return this.getAllBoatsService.getBoats(query);
  }
}
