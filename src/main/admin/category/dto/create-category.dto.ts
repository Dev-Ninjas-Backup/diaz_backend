import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category title',
    example: 'Boats',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Category image file',
  })
  image?: any;
}
