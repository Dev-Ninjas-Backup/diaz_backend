import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { BoatsService } from './services/boats.service';
import { GetBoatsService } from './services/get-boats.service';
import { GetAllBoatsAIServerDto } from './dto/get-all-boats-ai-server.dto';

@Controller('boats')
export class BoatsController {
  constructor(
    private readonly boatsService: BoatsService,
    private readonly getBoatsService: GetBoatsService,
  ) {}

  @ApiOperation({ summary: 'Get all boats For AI Server' })
  @Get()
  async getAllBoats(@Query() query: GetAllBoatsAIServerDto) {
    return this.getBoatsService.getAllBoats(query);
  }

  @ApiOperation({ summary: 'Get single boat details' })
  @Get(':boatId/details')
  async getSingleBoatDetails(@Param('boatId') boatId: string) {
    return this.boatsService.getSingleBoatDetails(boatId);
  }
}
