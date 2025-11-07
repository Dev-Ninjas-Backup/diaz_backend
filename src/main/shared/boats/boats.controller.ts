import { Controller, Query } from '@nestjs/common';
import { BoatsService } from './services/boats.service';
import { GetBoatsService } from './services/get-boats.service';

@Controller('boats')
export class BoatsController {
  constructor(
    private readonly boatsService: BoatsService,
    private readonly getBoatsService: GetBoatsService,
  ) {}

  async getAllBoats(@Query() query: any) {
    return this.getBoatsService.getAllBoats();
  }
}
