import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetBoatFeaturesDto } from '../dto/get-boat-features.dto';
import { GetBoatSpecificationsDto } from '../dto/get-boat-specifications.dto';
import { BoatsFeatureService } from '../services/boats-feature.service';
import { BoatsSpecificationService } from '../services/boats-specification.service';

@ApiTags('Shared -- Boats Specification & Features')
@Controller('boats')
export class BoatsSpecificationController {
  constructor(
    private readonly boatsSpecificationService: BoatsSpecificationService,
    private readonly boatsFeatureService: BoatsFeatureService,
  ) {}

  @Get('specification/list')
  @ApiOperation({
    summary: 'Get boat specifications by type (with optional search and limit)',
  })
  async getSpecifications(@Query() query: GetBoatSpecificationsDto) {
    return this.boatsSpecificationService.getSpecificationsByType(query);
  }

  @Get('features/list')
  @ApiOperation({
    summary: 'Get boat features by type (with optional search and limit)',
  })
  async getFeatures(@Query() query: GetBoatFeaturesDto) {
    return this.boatsFeatureService.getFeaturesByType(query);
  }
}
