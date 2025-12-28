import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  PolicyLinkDto,
  QuickLinkDto,
  SocialMediaLinkDto,
} from './create-footer.dto';

export class UpdateFooterDto {
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
