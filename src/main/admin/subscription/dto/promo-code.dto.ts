import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreatePromoCodeDto {
  @ApiProperty({ description: 'The promo code string' })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Number of free days provided by this code',
  })
  @IsNumber()
  @Min(0)
  freeDays: number;

  @ApiPropertyOptional({
    description: 'Maximum number of times this code can be used',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxRedemptions?: number;

  @ApiPropertyOptional({ description: 'Expiration date of the promo code' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ description: 'Stripe Coupon ID' })
  @IsOptional()
  @IsString()
  stripeCouponId?: string;
}

export class UpdatePromoCodeDto extends PartialType(CreatePromoCodeDto) {}
