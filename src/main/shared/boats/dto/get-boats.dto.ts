import { PaginationDto } from '@/common/dto/pagination.dto';
import { BoatsSourceEnum } from '@/common/enum/boats-source.enum';
import { FieldPreset } from '@/lib/boatsgroup/interface/boats-fields.interface';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export enum BoatClassEnum {
  Sailboat = 'Sailboat',
  Motorboat = 'Motorboat',
  Yacht = 'Yacht',
  Catamaran = 'Catamaran',
  Fishing = 'Fishing',
  Pontoon = 'Pontoon',
  Speedboat = 'Speedboat',
  RIB = 'RIB',
}

export class BoatSourceDto {
  @ApiPropertyOptional({
    default: BoatsSourceEnum.inventory,
    enum: BoatsSourceEnum,
  })
  @IsOptional()
  @IsEnum(BoatsSourceEnum)
  source?: BoatsSourceEnum = BoatsSourceEnum.inventory;
}

export class BoatFieldsDto extends BoatSourceDto {
  @ApiPropertyOptional({
    default: FieldPreset.minimal,
    enum: FieldPreset,
  })
  @IsOptional()
  @IsEnum(FieldPreset)
  fields?: FieldPreset = FieldPreset.minimal;
}

export class GetBoatsDto extends BoatFieldsDto {
  @ApiPropertyOptional({
    default: 1,
    description: 'Page number, starting from 1',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    default: 50,
    description: 'Number of items per page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @ApiPropertyOptional({
    description:
      'Boat make. Fetch available values from GET /boats/filter-options',
    example: 'Boston Whaler',
  })
  @IsOptional()
  @IsString()
  make?: string;

  @ApiPropertyOptional({
    description:
      'Boat model. Fetch available values from GET /boats/filter-options',
    example: '230 Vantage',
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({
    description: 'Exact build year',
    example: 2020,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  buildYear?: number;

  @ApiPropertyOptional({
    description: 'Build year start range',
    example: 2015,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  buildYearStart?: number;

  @ApiPropertyOptional({
    description: 'Build year end range',
    example: 2024,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  buildYearEnd?: number;

  @ApiPropertyOptional({
    description: 'Length start range in feet',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lengthStart?: number;

  @ApiPropertyOptional({
    description: 'Length end range in feet',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lengthEnd?: number;

  @ApiPropertyOptional({
    description: 'Price start range',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceStart?: number;

  @ApiPropertyOptional({
    description: 'Price end range',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceEnd?: number;

  @ApiPropertyOptional({
    description:
      'City location. Fetch available values from GET /boats/filter-options',
    example: 'Miami',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description:
      'State location. Fetch available values from GET /boats/filter-options',
    example: 'FL',
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({
    description: 'Boat class',
    enum: BoatClassEnum,
  })
  @IsOptional()
  @IsString()
  class?: string;
}

export class GetSingleBoatDto extends BoatFieldsDto {}

export class GetMergedBoatsDto extends PaginationDto {
  @ApiPropertyOptional({
    default: FieldPreset.minimal,
    enum: FieldPreset,
  })
  @IsOptional()
  @IsEnum(FieldPreset)
  fields?: FieldPreset = FieldPreset.minimal;
}
