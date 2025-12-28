import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SiteType } from 'generated/client';

export class CreateWhyUsDto {
  @ApiProperty({
    enum: SiteType,
    example: SiteType.FLORIDA,
    description: 'Site type',
  })
  @IsEnum(SiteType)
  @IsNotEmpty()
  site: SiteType;

  @ApiProperty({
    example: 'Why Choose Us',
    description: 'Main title',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

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
    description: 'First image file',
  })
  image1?: any;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Second image file',
  })
  image2?: any;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Third image file',
  })
  image3?: any;
}
