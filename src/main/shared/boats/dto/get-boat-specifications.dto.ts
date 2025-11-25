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
import { BoatSpecificationType } from 'generated/client';

export class GetBoatSpecificationsDto {
  @ApiProperty({
    enum: BoatSpecificationType,
    description:
      'Type of boat specification to retrieve (e.g. MAKE, MODEL, FUEL_TYPE)',
    example: 'MAKE',
  })
  @IsEnum(BoatSpecificationType)
  type: BoatSpecificationType;

  @ApiPropertyOptional({
    description:
      'Optional search term for filtering results (supports partial match, case-insensitive)',
    example: 'hydra',
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
