import { ApiProperty } from '@nestjs/swagger';
import { BoatFuelType, BoatPropellerType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsString, Max, Min } from 'class-validator';

export class BoatDimensionsDto {
  @ApiProperty({ example: 36, description: 'Length feet part' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  lengthFeet: number;

  @ApiProperty({ example: 6, description: 'Length inches part' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(11)
  lengthInches: number;

  @ApiProperty({ example: 12, description: 'Beam feet part' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  beamFeet: number;

  @ApiProperty({ example: 6, description: 'Beam inches part' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(11)
  beamInches: number;

  @ApiProperty({ example: 3, description: 'Draft feet part' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  draftFeet: number;

  @ApiProperty({ example: 2, description: 'Draft inches part' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(11)
  draftInches: number;
}

export class ExtraDetailItemDto {
  @ApiProperty({
    description: 'Key for the additional detail example: "yearOfRefit"',
  })
  @IsString()
  key: string;

  @ApiProperty({
    description: 'Value for the additional detail; free-form string',
  })
  @IsString()
  value: string;
}

export class BoatEngineDto {
  @ApiProperty({ example: 1200, description: 'Total run hours on the engine' })
  @IsInt()
  @Min(0)
  hours: number;

  @ApiProperty({ example: 350, description: 'Horsepower' })
  @IsInt()
  @Min(0)
  horsepower: number;

  @ApiProperty({ example: 'Mercury', description: 'Engine make/manufacturer' })
  @IsString()
  make: string;

  @ApiProperty({ example: 'Verado 350', description: 'Engine model' })
  @IsString()
  model: string;

  @ApiProperty({ enum: BoatFuelType })
  @IsEnum(BoatFuelType)
  fuelType: BoatFuelType;

  @ApiProperty({ enum: BoatPropellerType })
  @IsEnum(BoatPropellerType)
  propellerType: BoatPropellerType;
}
