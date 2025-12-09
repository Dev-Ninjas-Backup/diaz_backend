import { ApiProperty } from '@nestjs/swagger';

export class PerformanceOverviewDto {
  @ApiProperty({
    description: 'Total unique visitor sessions for the current month',
  })
  totalVisitors: number;

  @ApiProperty({ description: 'Total page views for the current month' })
  totalPageViews: number;

  @ApiProperty({
    description:
      'Sum of active listings price for the current month (currency per listing)',
  })
  totalListingValue: number;
}
