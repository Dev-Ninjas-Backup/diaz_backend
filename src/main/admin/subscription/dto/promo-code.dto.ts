import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreatePromoCodeDto {
  @ApiProperty({ description: 'The promo code string', example: 'FREE30' })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Number of free days provided by this code',
    example: 30,
  })
  @IsNumber()
  @Min(0)
  freeDays: number;

  @ApiPropertyOptional({
    description: 'Maximum number of times this code can be used',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxRedemptions?: number;

  @ApiPropertyOptional({
    description: 'Expiration date of the promo code',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class UpdatePromoCodeDto extends PartialType(CreatePromoCodeDto) {}
