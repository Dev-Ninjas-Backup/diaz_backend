import {
  BoatClass,
  BoatCondition,
  BoatFuelType,
  BoatMaterial,
} from '@/common/enum/boats.enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import {
  BoatDimensionsDto,
  BoatEngineDto,
  ExtraDetailItemDto,
} from './boats.dto';

export class BoatsInfoOnBoardingDto {
  @ApiProperty({ example: 'Sapphire', description: 'Boat display name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 125000.5, description: 'Listing price' })
  @Type(() => Number)
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ description: 'Optional description' })
  @IsOptional()
  @IsString()
  description?: string;

  // Specifications
  @ApiProperty({ example: 2018, description: 'Year the boat was built' })
  @Type(() => Number)
  @IsInt()
  buildYear: number;

  @ApiProperty({ example: 'Beneteau', description: 'Manufacturer' })
  @IsString()
  make: string;

  @ApiProperty({ example: 'Oceanis 38', description: 'Model name' })
  @IsString()
  model: string;

  @ApiProperty({ enum: BoatFuelType })
  @IsEnum(BoatFuelType)
  fuelType: BoatFuelType;

  @ApiProperty({ enum: BoatClass })
  @IsEnum(BoatClass)
  boatClass: BoatClass;

  @ApiProperty({ enum: BoatMaterial })
  @IsEnum(BoatMaterial)
  material: BoatMaterial;

  @ApiProperty({ enum: BoatCondition })
  @IsEnum(BoatCondition)
  condition: BoatCondition;

  @ApiProperty({ type: BoatDimensionsDto })
  @ValidateNested()
  @Type(() => BoatDimensionsDto)
  boatDimensions: BoatDimensionsDto;

  @ApiProperty({ example: 2, description: 'Number of engines' })
  @Type(() => Number)
  @IsInt()
  enginesNumber: number;

  @ApiProperty({ example: 3, description: 'Number of cabins' })
  @Type(() => Number)
  @IsInt()
  cabinsNumber: number;

  @ApiProperty({ example: 2, description: 'Number of heads/bathrooms' })
  @IsInt()
  headsNumber: number;

  // Address
  @ApiProperty({
    example: 'Miami',
    description: 'City where the boat is located',
  })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Florida', description: 'State/region' })
  @IsString()
  state: string;

  @ApiProperty({ example: '33101', description: 'ZIP/postal code' })
  @IsString()
  zip: string;

  // Extra details
  @ApiPropertyOptional({
    type: [ExtraDetailItemDto],
    description: 'Free-form key/value pairs for additional fields',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExtraDetailItemDto)
  extraDetails?: ExtraDetailItemDto[];

  // Nested engines info
  @ApiPropertyOptional({
    type: [BoatEngineDto],
    description: 'Optional inline engine objects',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BoatEngineDto)
  engines?: BoatEngineDto[];

  // Media
  @ApiPropertyOptional({
    description: 'Video URL for the boat',
    example: 'https://www.youtube.com/watch?v=8eZu8K5W0mM',
  })
  @IsOptional()
  @IsUrl()
  videoURL?: string;
}
