import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    description: 'Category title',
    example: 'Boats',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Category image file',
  })
  image?: any;
}
