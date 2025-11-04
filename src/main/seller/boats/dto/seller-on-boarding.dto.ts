import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  BoatClass,
  BoatCondition,
  BoatFuelType,
  BoatMaterial,
  BoatPropellerType,
} from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

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

  @ApiProperty({
    example: 36.5,
    description: 'Length in feet (e.g. 36.5 = 36\'6")',
  })
  @Type(() => Number)
  @IsNumber()
  length: number;

  @ApiProperty({ example: 12.5, description: 'Beam in feet' })
  @Type(() => Number)
  @IsNumber()
  beam: number;

  @ApiProperty({ example: 3.2, description: 'Draft in feet' })
  @Type(() => Number)
  @IsNumber()
  draft: number;

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
}

export class SellerInfoOnBoardingDto {
  @ApiProperty({
    example: 'Sajib Hossen',
    description: 'Full name of the seller',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: '+8801XXXXXXXXX',
    description: 'Phone number in international format',
  })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'Bangladesh' })
  @IsString()
  country: string;

  @ApiProperty({ example: 'Dhaka' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Dhaka' })
  @IsString()
  state: string;

  @ApiProperty({ example: '1207' })
  @IsString()
  zip: string;

  // Authentication Details
  @ApiProperty({ example: 'seller@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'seller_username' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'strongPassword123!' })
  @IsString()
  password: string;
}

export class SellerOnBoardingDto {
  @ApiPropertyOptional({ type: BoatsInfoOnBoardingDto })
  @ValidateNested()
  @Type(() => BoatsInfoOnBoardingDto)
  boatInfo: BoatsInfoOnBoardingDto;

  @ApiProperty({ type: SellerInfoOnBoardingDto })
  @ValidateNested()
  @Type(() => SellerInfoOnBoardingDto)
  sellerInfo: SellerInfoOnBoardingDto;
}

export class SellerOnboardingFilesDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description:
      'Cover Images to upload (multipart file). Use this field when uploading files.',
    isArray: true,
  })
  covers?: Express.Multer.File[];

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description:
      'Gallery Images to upload (multipart file). Use this field when uploading files.',
    isArray: true,
  })
  galleries?: Express.Multer.File[];
}
