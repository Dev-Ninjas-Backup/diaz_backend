import { ApiProperty } from '@nestjs/swagger';
import { BoatFuelType, BoatPropellerType } from '@prisma/client';
import { IsEnum, IsInt, IsString, Min } from 'class-validator';

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
