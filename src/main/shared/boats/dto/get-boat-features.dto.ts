import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { BoatFeatureType } from 'generated/client';

export class GetBoatFeaturesDto {
  @ApiProperty({
    enum: BoatFeatureType,
    description:
      'Type of boat feature to retrieve (e.g. ELECTRONICS, OUTSIDE_EQUIPMENT)',
    example: 'ELECTRONICS',
  })
  @IsEnum(BoatFeatureType)
  type: BoatFeatureType;

  @ApiPropertyOptional({
    description:
      'Optional search term for filtering results (supports partial match, case-insensitive)',
    example: 'gps',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Limit the number of results (default: 20, max: 100)',
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
