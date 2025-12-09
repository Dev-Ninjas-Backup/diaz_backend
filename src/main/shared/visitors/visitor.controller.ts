import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { VisitorService } from './services/visitor.service';

@ApiTags('Shared -- Visitor Analytics')
@Controller('visitor/analytics')
export class VisitorController {
  constructor(private readonly visitorService: VisitorService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get visitor analytics overview' })
  async getOverview() {
    return this.visitorService.getAnalyticsOverview();
  }
}
