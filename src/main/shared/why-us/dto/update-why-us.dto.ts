import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateWhyUsDto {
  @ApiPropertyOptional({
    example: 'Why Choose Us',
    description: 'Main title',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    example: 'We are the leading yacht broker with years of experience',
    description: 'Description text',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: '25+ Years of Excellence',
    description: 'Excellence/experience text',
  })
  @IsString()
  @IsOptional()
  excellence?: string;

  @ApiPropertyOptional({
    example: '1000+',
    description: 'Number of boats sold per year',
  })
  @IsString()
  @IsOptional()
  boatsSoldPerYear?: string;

  @ApiPropertyOptional({
    example: '10M+',
    description: 'Number of listings viewed',
  })
  @IsString()
  @IsOptional()
  listingViewed?: string;

  @ApiPropertyOptional({
    example: 'Learn More',
    description: 'Button text',
  })
  @IsString()
  @IsOptional()
  buttonText?: string;

  @ApiPropertyOptional({
    example: '/about-us',
    description: 'Button link URL',
  })
  @IsString()
  @IsOptional()
  buttonLink?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'First image file (optional - replace existing)',
  })
  image1?: any;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Second image file (optional - replace existing)',
  })
  image2?: any;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Third image file (optional - replace existing)',
  })
  image3?: any;
}
