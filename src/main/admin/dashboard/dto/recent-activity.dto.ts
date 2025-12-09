import { ApiProperty } from '@nestjs/swagger';

export class RecentActivityItemDto {
  @ApiProperty()
  type: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  meta?: Record<string, unknown>;
}
