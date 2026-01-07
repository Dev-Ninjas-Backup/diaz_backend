import { PaginationDto } from '@/common/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetAllBoatsCustomDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Boat make' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value?.trim() === '' ? undefined : value))
  make?: string;

  @ApiPropertyOptional({ description: 'Boat model' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value?.trim() === '' ? undefined : value))
  model?: string;

  @ApiPropertyOptional({
    description:
      'Boat class. Fetch available values from GET /boats/filter-options',
  })
  @IsOptional()
  @IsString()
  class?: string;

  @ApiPropertyOptional({ description: 'Exact build year' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  buildYear?: number;

  @ApiPropertyOptional({ description: 'Build year start range' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  buildYearStart?: number;

  @ApiPropertyOptional({ description: 'Build year end range' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  buildYearEnd?: number;

  @ApiPropertyOptional({ description: 'Price start range' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceStart?: number;

  @ApiPropertyOptional({ description: 'Price end range' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceEnd?: number;

  @ApiPropertyOptional({ description: 'Length start range in feet' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lengthStart?: number;

  @ApiPropertyOptional({ description: 'Length end range in feet' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lengthEnd?: number;

  @ApiPropertyOptional({ description: 'Beam start range in feet' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  beamSizeStart?: number;

  @ApiPropertyOptional({ description: 'Beam end range in feet' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  beamSizeEnd?: number;

  @ApiPropertyOptional({ description: 'Number of engines' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  enginesNumber?: number;

  @ApiPropertyOptional({ description: 'Number of heads' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  headsNumber?: number;

  @ApiPropertyOptional({ description: 'Number of cabins' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cabinsNumber?: number;

  @ApiPropertyOptional({ description: 'City or state for location search' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value?.trim() === '' ? undefined : value))
  location?: string;
}
