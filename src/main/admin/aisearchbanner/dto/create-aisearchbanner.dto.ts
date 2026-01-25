import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateAISearchBannerDto {
  @ApiProperty({
    description: 'Banner title for AI search section',
    example: 'Find Your Dream Boat with AI',
  })
  @IsString()
  bannerTitle: string;

  @ApiProperty({
    required: false,
    description: 'Optional subtitle for the banner',
    example: 'Smart search powered by artificial intelligence',
  })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'AI search banner image (JPEG, PNG, WebP)',
  })
  aisearchBanner?: any;
}
