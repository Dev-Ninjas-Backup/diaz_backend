import { PaginationDto } from '@/common/dto/pagination.dto';
import { BoatsSourceEnum } from '@/common/enum/boats-source.enum';
import { FieldPreset } from '@/lib/boatsgroup/interface/boats-fields.interface';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

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
