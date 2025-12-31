import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateOurStoryDto {
  @ApiProperty({
    example: 'Our Story',
    description: 'Title of the Our Story section',
    required: false,
    type: 'string',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    example: 'This is our story...',
    description: 'Description content of the Our Story section',
    required: false,
    type: 'string',
  })
  @IsString()
  @IsOptional()
  description?: string;

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

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Fourth image file',
    required: false,
  })
  image4?: Express.Multer.File;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Fifth image file',
    required: false,
  })
  image5?: Express.Multer.File;
}
