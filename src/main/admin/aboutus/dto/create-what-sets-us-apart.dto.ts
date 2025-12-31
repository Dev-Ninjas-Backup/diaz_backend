import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateWhatSetsUsApartDto {
  @ApiProperty({
    example: 'What Sets Us Apart',
    description: 'Title of the What Sets Us Apart section',
    type: 'string',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'This is what sets us apart...',
    description: 'Description content',
    required: false,
    type: 'string',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: '20+',
    description: 'Years of yachting excellence',
    required: false,
    type: 'string',
  })
  @IsString()
  @IsOptional()
  yearsOfYachtingExcellence?: string;

  @ApiProperty({
    example: '1000+',
    description: 'Number of boats sold in 2024',
    required: false,
    type: 'string',
  })
  @IsString()
  @IsOptional()
  boatsSoldIn2024?: string;

  @ApiProperty({
    example: '10M+',
    description: 'Number of listings viewed monthly',
    required: false,
    type: 'string',
  })
  @IsString()
  @IsOptional()
  listingsViewedMonthly?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'First image file',
    required: false,
  })
  image1?: Express.Multer.File;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Second image file',
    required: false,
  })
  image2?: Express.Multer.File;
}
