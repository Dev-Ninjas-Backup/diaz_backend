import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './services/dashboard.service';

@ApiTags('Admin Dashboard')
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get admin dashboard summary stats' })
  getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('recent-activity')
  @ApiOperation({ summary: 'Get recent admin activities' })
  getRecentActivity() {
    return this.dashboardService.getRecentActivity();
  }

  @Get('performance-overview')
  @ApiOperation({ summary: 'Get performance overview metrics' })
  getPerformanceOverview() {
    return this.dashboardService.getPerformanceOverview();
  }
}
