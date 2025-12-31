import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateMissionVisionDto {
  @ApiProperty({
    example: 'Our Mission',
    description: 'Mission title',
    required: false,
    type: 'string',
  })
  @IsString()
  @IsOptional()
  mission?: string;

  @ApiProperty({
    example: 'This is our mission description...',
    description: 'Mission description',
    required: false,
    type: 'string',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'This is our vision description...',
    description: 'Vision description',
    required: false,
    type: 'string',
  })
  @IsString()
  @IsOptional()
  visionDescription?: string;

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

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Third image file',
    required: false,
  })
  image3?: Express.Multer.File;
}
