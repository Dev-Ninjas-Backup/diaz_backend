import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SiteType } from 'generated/client';

export class FooterDataDto {
  @ApiProperty({ example: 'uuid-string' })
  id: string;

  @ApiProperty({ enum: SiteType, example: SiteType.FLORIDA })
  site: SiteType;

  @ApiPropertyOptional({ example: 'Jupiter Marine Sales' })
  companyName?: string;

  @ApiPropertyOptional({ example: 'Your trusted yacht broker' })
  companyDescription?: string;

  @ApiPropertyOptional({
    example: [
      { label: 'About Us', url: '/about' },
      { label: 'Services', url: '/services' },
    ],
  })
  quickLinks?: any;

  @ApiPropertyOptional({
    example: [
      { label: 'Privacy Policy', url: '/privacy' },
      { label: 'Terms of Service', url: '/terms' },
    ],
  })
  policyLinks?: any;

  @ApiPropertyOptional({ example: '+1 (555) 123-4567' })
  phone?: string;

  @ApiPropertyOptional({ example: 'contact@example.com' })
  email?: string;

  @ApiPropertyOptional({
    example: [
      {
        platform: 'facebook',
        url: 'https://facebook.com/...',
        icon: 'fab fa-facebook',
      },
    ],
  })
  socialMediaLinks?: any;

  @ApiPropertyOptional({
    example: '© Copyright 2025 by Jupiter Marine Sales. All rights reserved.',
  })
  copyrightText?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class FooterResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Footer retrieved successfully' })
  message: string;

  @ApiProperty({ type: FooterDataDto })
  data: FooterDataDto;
}
