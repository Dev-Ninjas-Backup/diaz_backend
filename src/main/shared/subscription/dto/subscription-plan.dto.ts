import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PlanType } from 'generated/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateSubscriptionPlanDto {
  @ApiProperty({ description: 'Plan title', example: 'Gold Plan' })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({
    description: 'Type of plan',
    enum: PlanType,
    example: PlanType.GOLD,
  })
  @IsEnum(PlanType)
  planType: PlanType;

  @ApiPropertyOptional({
    description: 'Plan description',
    example: 'Basic plan for starters',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'List of benefits included in the plan',
    example: ['5 listings', '500 word limit', 'Email support'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  @ApiPropertyOptional({
    description: 'Maximum number of pictures allowed',
    example: 5,
    default: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  picLimit?: number;

  @ApiPropertyOptional({
    description: 'Maximum word limit for listings',
    example: 500,
    default: 500,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  wordLimit?: number;

  @ApiPropertyOptional({
    description: 'Mark this plan as the best/recommended',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isBest?: boolean;

  @ApiPropertyOptional({
    description: 'Whether this plan is active and available',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Plan price in USD',
    example: 29.99,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description: 'Currency code',
    example: 'usd',
    default: 'usd',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Billing period in months',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  billingPeriodMonths?: number;
}

export class UpdateSubscriptionPlanDto extends PartialType(
  CreateSubscriptionPlanDto,
) {}
