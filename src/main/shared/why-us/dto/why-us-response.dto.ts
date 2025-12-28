import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SiteType } from 'generated/client';

export class WhyUsImageDto {
  @ApiProperty({ example: 'uuid-string' })
  id: string;

  @ApiProperty({ example: 'image.jpg' })
  filename: string;

  @ApiProperty({ example: 'https://...' })
  url: string;
}

export class WhyUsDataDto {
  @ApiProperty({ example: 'uuid-string' })
  id: string;

  @ApiProperty({ enum: SiteType, example: SiteType.FLORIDA })
  site: SiteType;

  @ApiProperty({ example: 'Why Choose Us' })
  title: string;

  @ApiPropertyOptional({ example: 'We are the leading yacht broker' })
  description?: string;

  @ApiPropertyOptional({ example: '25+ Years of Excellence' })
  excellence?: string;

  @ApiPropertyOptional({ example: '1000+' })
  boatsSoldPerYear?: string;

  @ApiPropertyOptional({ example: '10M+' })
  listingViewed?: string;

  @ApiPropertyOptional({ example: 'Learn More' })
  buttonText?: string;

  @ApiPropertyOptional({ example: '/about-us' })
  buttonLink?: string;

  @ApiPropertyOptional({ type: WhyUsImageDto })
  image1?: WhyUsImageDto;

  @ApiPropertyOptional({ type: WhyUsImageDto })
  image2?: WhyUsImageDto;

  @ApiPropertyOptional({ type: WhyUsImageDto })
  image3?: WhyUsImageDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class WhyUsResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Why Us section retrieved successfully' })
  message: string;

  @ApiProperty({ type: WhyUsDataDto })
  data: WhyUsDataDto;
}
