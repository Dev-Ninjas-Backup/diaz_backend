import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { SiteType } from 'generated/client';

export class QuickLinkDto {
  @ApiProperty({ example: 'About Us' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ example: '/about' })
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class PolicyLinkDto {
  @ApiProperty({ example: 'Privacy Policy' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ example: '/privacy' })
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class SocialMediaLinkDto {
  @ApiProperty({ example: 'facebook', description: 'Platform name' })
  @IsString()
  @IsNotEmpty()
  platform: string;

  @ApiProperty({ example: 'https://facebook.com/...' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({
    example: 'fab fa-facebook',
    description: 'Icon class',
  })
  @IsString()
  @IsOptional()
  icon?: string;
}

export class CreateFooterDto {
  @ApiProperty({ enum: SiteType, example: SiteType.FLORIDA })
  @IsEnum(SiteType)
  @IsNotEmpty()
  site: SiteType;

  @ApiPropertyOptional({ example: 'Jupiter Marine Sales' })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiPropertyOptional({ example: 'Your trusted yacht broker' })
  @IsString()
  @IsOptional()
  companyDescription?: string;

  @ApiPropertyOptional({ type: [QuickLinkDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuickLinkDto)
  @IsOptional()
  quickLinks?: QuickLinkDto[];

  @ApiPropertyOptional({ type: [PolicyLinkDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PolicyLinkDto)
  @IsOptional()
  policyLinks?: PolicyLinkDto[];

  @ApiPropertyOptional({ example: '+1 (555) 123-4567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'contact@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ type: [SocialMediaLinkDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialMediaLinkDto)
  @IsOptional()
  socialMediaLinks?: SocialMediaLinkDto[];

  @ApiPropertyOptional({
    example: '© Copyright 2025 by Jupiter Marine Sales. All rights reserved.',
  })
  @IsString()
  @IsOptional()
  copyrightText?: string;
}
