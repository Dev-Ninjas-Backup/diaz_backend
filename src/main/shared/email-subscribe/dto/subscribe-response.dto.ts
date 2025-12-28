import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SiteType } from 'generated/client';

export class EmailSubscriptionDataDto {
  @ApiProperty({ example: 'uuid-string' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ enum: SiteType, example: SiteType.FLORIDA })
  site: SiteType;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty()
  subscribedAt: Date;

  @ApiPropertyOptional()
  unsubscribedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class SubscribeResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Successfully subscribed to newsletter' })
  message: string;

  @ApiProperty({ type: EmailSubscriptionDataDto })
  data: EmailSubscriptionDataDto;
}

export class UnsubscribeResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Successfully unsubscribed from newsletter' })
  message: string;

  @ApiProperty({ type: EmailSubscriptionDataDto })
  data: EmailSubscriptionDataDto;
}
