import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
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

export class BoatsInfoDto {
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

  @ApiProperty({ example: 'Mercury', description: 'Engine make/manufacturer' })
  @IsString()
  fuelType: string;

  @ApiProperty({ example: 12, description: 'Boat class' })
  @IsString()
  boatClass: string;

  @ApiProperty({ example: 'Aluminium', description: 'Boat material' })
  @IsString()
  material: string;

  @ApiProperty({ example: 'New', description: 'Boat condition' })
  @IsString()
  condition: string;

  @ApiPropertyOptional({ example: 'Propeller', description: 'Engine type' })
  @IsOptional()
  @IsString()
  engineType?: string;

  @ApiPropertyOptional({ example: 'Propeller', description: 'Propeller type' })
  @IsOptional()
  @IsString()
  propType?: string;

  @ApiPropertyOptional({
    example: 'Aluminium',
    description: 'Propeller material',
  })
  @IsOptional()
  @IsString()
  propMaterial?: string;

  @ApiProperty({ type: () => BoatDimensionsDto })
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

  // * Features
  @ApiProperty({
    example: ['GPS', 'Radio', 'Autopilot'],
    description: 'List of electronic features',
  })
  @IsArray()
  @IsString({ each: true })
  electronics: string[];

  @ApiProperty({
    example: ['Air Conditioning', 'Heating'],
    description: 'List of inside equipment features',
  })
  @IsArray()
  @IsString({ each: true })
  insideEquipment: string[];

  @ApiProperty({
    example: ['Cockpit Cushions', 'Davit(s)'],
    description: 'List of outside equipment features',
  })
  @IsArray()
  @IsString({ each: true })
  outsideEquipment: string[];

  @ApiProperty({
    example: ['Generator', 'Shore Power Inlet'],
    description: 'List of electrical equipment features',
  })
  @IsArray()
  @IsString({ each: true })
  electricalEquipment: string[];

  @ApiProperty({
    example: ['Bimini Top', 'Hard Top'],
    description: 'List of cover features',
  })
  @IsArray()
  @IsString({ each: true })
  coversEquipment: string[];

  @ApiProperty({
    example: ['Jacuzzi', 'Pool', 'Wine Cellar'],
    description: 'List of additional equipment features',
  })
  @IsArray()
  @IsString({ each: true })
  additionalEquipment: string[];

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
    type: () => [ExtraDetailItemDto],
    description: 'Free-form key/value pairs for additional fields',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExtraDetailItemDto)
  extraDetails?: ExtraDetailItemDto[];

  // Media
  @ApiPropertyOptional({
    description: 'Video URL for the boat',
    example: 'https://www.youtube.com/watch?v=8eZu8K5W0mM',
  })
  @IsOptional()
  @IsUrl()
  videoURL?: string;
}

export class CreateBoatsInfoDto extends BoatsInfoDto {
  // Nested engines info
  @ApiPropertyOptional({
    type: () => [BoatEngineDto],
    description: 'Optional inline engine objects',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BoatEngineDto)
  engines?: BoatEngineDto[];
}
