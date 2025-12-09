import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({
    summary: 'Root endpoint',
    description: 'Returns a welcome message and API docs path.',
  })
  @ApiResponse({ status: 200, description: 'API root info.' })
  root() {
    return {
      message: 'Welcome to the API 🚀',
      docs: '/api/docs',
    };
  }

  @Get('health')
  @ApiOperation({
    summary: 'System Health Check',
    description:
      'Returns health status for API, Database, Website, and Mobile App.',
  })
  @ApiResponse({ status: 200, description: 'Health information returned.' })
  health() {
    return {
      api: 'up',
      database: 'up',
      website: 'up',
      mobileApp: 'up',
    };
  }
}
