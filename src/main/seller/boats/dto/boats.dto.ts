import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateBoatsInfoDto } from './boats-info.dto';

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

  @ApiProperty({ example: 'Mercury', description: 'Engine make/manufacturer' })
  @IsString()
  fuelType: string;

  @ApiProperty({ example: 12, description: 'Boat class' })
  @IsString()
  propellerType: string;
}

export class UpdateBoatEngineDto extends PartialType(BoatEngineDto) {
  @ApiProperty({
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUId of engine to delete',
  })
  @IsUUID()
  id: string;
}

export class BoatListingFilesDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description:
      'Cover Images to upload (multipart file). Maximum 5 files. To replace: first delete the old image UUID via imagesToDelete, then upload new cover here.',
    isArray: true,
  })
  covers?: Express.Multer.File[];

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Gallery Images to upload (multipart file). Maximum 70 files.',
    isArray: true,
  })
  galleries?: Express.Multer.File[];
}

export class BoatListingDto extends BoatListingFilesDto {
  @ApiProperty({ type: CreateBoatsInfoDto })
  @ValidateNested()
  @Type(() => CreateBoatsInfoDto)
  boatInfo: CreateBoatsInfoDto;
}
