import { ApiProperty } from '@nestjs/swagger';
import { SiteType } from 'generated/enums';

export class AboutUsResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ enum: SiteType, example: SiteType.FLORIDA })
  site: SiteType;

  @ApiProperty({ example: 'OUR STORY' })
  aboutTitle: string;

  @ApiProperty({
    example:
      "At Florida Yacht Trader, we make buying and selling yachts effortless. Built exclusively for the Sunshine State, our platform connects passionate boaters, serious buyers, and trusted sellers in the nation's most vibrant yachting market.",
  })
  aboutDescription: string;

  @ApiProperty({
    example: 'Our mission is to make yacht trading effortless and accessible.',
  })
  mission: string;

  @ApiProperty({
    example: 'To be the premier yacht trading platform in the nation.',
  })
  vision: string;

  @ApiProperty({ example: '2025-12-30T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-12-30T10:00:00.000Z' })
  updatedAt: Date;
}
