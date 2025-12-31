import { ExtraDetailItemDto } from '@/main/seller/boats/dto/boats.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateNested,
} from 'class-validator';
import { BoatListingStatus } from 'generated/client';

export class UpdateListingDto {
  @ApiPropertyOptional({
    example: 'Sapphire',
    description: 'Boat display name',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 125000.5,
    description: 'Listing price',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ description: 'Optional description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 2018,
    description: 'Year the boat was built',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  buildYear?: number;

  @ApiPropertyOptional({
    example: 'Beneteau',
    description: 'Manufacturer',
  })
  @IsOptional()
  @IsString()
  make?: string;

  @ApiPropertyOptional({
    example: 'Oceanis 38',
    description: 'Model name',
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({
    example: 'Mercury',
    description: 'Engine make/manufacturer',
  })
  @IsOptional()
  @IsString()
  fuelType?: string;

  @ApiPropertyOptional({
    example: '12',
    description: 'Boat class',
  })
  @IsOptional()
  @IsString()
  class?: string;

  @ApiPropertyOptional({
    example: 'Aluminium',
    description: 'Boat material',
  })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional({
    example: 'New',
    description: 'Boat condition',
  })
  @IsOptional()
  @IsString()
  condition?: string;

  @ApiPropertyOptional({
    example: 'Propeller',
    description: 'Engine type',
  })
  @IsOptional()
  @IsString()
  engineType?: string;

  @ApiPropertyOptional({
    example: 'Propeller',
    description: 'Propeller type',
  })
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

  @ApiPropertyOptional({
    example: 36.5,
    description: 'Length in feet (e.g., 36.5 = 36\'6")',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  length?: number;

  @ApiPropertyOptional({
    example: 12.5,
    description: 'Beam in feet',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  beam?: number;

  @ApiPropertyOptional({
    example: 3.2,
    description: 'Draft in feet',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  draft?: number;

  @ApiPropertyOptional({
    example: 2,
    description: 'Number of engines',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  enginesNumber?: number;

  @ApiPropertyOptional({
    example: 3,
    description: 'Number of cabins',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  cabinsNumber?: number;

  @ApiPropertyOptional({
    example: 2,
    description: 'Number of heads/bathrooms',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  headsNumber?: number;

  @ApiPropertyOptional({
    example: ['GPS', 'Radio', 'Autopilot'],
    description: 'List of electronic features',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  electronics?: string[];

  @ApiPropertyOptional({
    example: ['Air Conditioning', 'Heating'],
    description: 'List of inside equipment features',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  insideEquipment?: string[];

  @ApiPropertyOptional({
    example: ['Cockpit Cushions', 'Davit(s)'],
    description: 'List of outside equipment features',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  outsideEquipment?: string[];

  @ApiPropertyOptional({
    example: ['Generator', 'Shore Power Inlet'],
    description: 'List of electrical equipment features',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  electricalEquipment?: string[];

  @ApiPropertyOptional({
    example: ['Bimini Top', 'Hard Top'],
    description: 'List of cover features',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  covers?: string[];

  @ApiPropertyOptional({
    example: ['Jacuzzi', 'Pool', 'Wine Cellar'],
    description: 'List of additional equipment features',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  additionalEquipment?: string[];

  @ApiPropertyOptional({
    example: 'Miami',
    description: 'City where the boat is located',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    example: 'Florida',
    description: 'State/region',
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({
    example: '33101',
    description: 'ZIP/postal code',
  })
  @IsOptional()
  @IsString()
  zip?: string;

  @ApiPropertyOptional({
    type: () => [ExtraDetailItemDto],
    description: 'Free-form key/value pairs for additional fields',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExtraDetailItemDto)
  extraDetails?: ExtraDetailItemDto[];

  @ApiPropertyOptional({
    enum: BoatListingStatus,
    description: 'Listing status',
    example: BoatListingStatus.ACTIVE,
    default: BoatListingStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(BoatListingStatus)
  status?: BoatListingStatus;

  @ApiPropertyOptional({
    description: 'Video URL for the boat',
    example: 'https://www.youtube.com/watch?v=8eZu8K5W0mM',
  })
  @IsOptional()
  @IsUrl()
  videoURL?: string;
}
