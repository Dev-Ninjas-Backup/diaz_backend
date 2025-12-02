import { ApiProperty } from '@nestjs/swagger';

export class DashboardSummaryDto {
  @ApiProperty()
  totalYachtsListed: number;

  @ApiProperty()
  totalPendingApprovals: number;

  @ApiProperty()
  totalVerifiedSellers: number;

  @ApiProperty({
    required: false,
    description: 'Percent change vs previous month (positive means increase)',
  })
  totalYachtsListedChangePercent?: number | null;

  @ApiProperty({
    required: false,
    description: 'New verified sellers in the last 7 days',
  })
  newVerifiedSellersThisWeek?: number;

  @ApiProperty({
    required: false,
    description: 'Most recent insert for selected tables',
    type: Object,
  })
  recentActivity?: Record<string, any>;
}
