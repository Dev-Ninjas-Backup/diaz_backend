import { ApiProperty } from '@nestjs/swagger';

export class DailyLeadItemDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  user_id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  product: string;

  @ApiProperty({ example: 'not contacted' })
  status: string;

  @ApiProperty({ example: '2026-03-11T22:59:57.848307+00:00' })
  created_at: string;

  @ApiProperty({ example: '2026-03-11T22:59:57.848307+00:00' })
  updated_at: string;
}

export class DailyLeadsResponseDto {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty()
  total_leads: number;

  @ApiProperty({ type: [DailyLeadItemDto] })
  leads: DailyLeadItemDto[];
}

export class DailyLeadsPaginatedMetadataDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPage: number;
}

export class DailyLeadsPaginatedResponseDto extends DailyLeadsResponseDto {
  @ApiProperty({ type: DailyLeadsPaginatedMetadataDto })
  metadata: DailyLeadsPaginatedMetadataDto;
}
