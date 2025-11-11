import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetBoatSpecificationsDto } from '../dto/get-boat-specifications.dto';
import { BoatsSpecificationService } from '../services/boats-specification.service';

@ApiTags('Shared -- Boats Specification & Features')
@Controller('boats/specification')
export class BoatsSpecificationController {
  constructor(
    private readonly boatsSpecificationService: BoatsSpecificationService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get boat specifications by type (with optional search and limit)',
  })
  async getSpecifications(@Query() query: GetBoatSpecificationsDto) {
    return this.boatsSpecificationService.getSpecificationsByType(query);
  }
}
