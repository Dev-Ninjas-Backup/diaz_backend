import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { SiteType } from 'generated/client';

export class SubscribeEmailDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address to subscribe',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({
    enum: SiteType,
    example: SiteType.FLORIDA,
    description: 'Site to subscribe to (defaults to FLORIDA)',
  })
  @IsEnum(SiteType)
  @IsOptional()
  site?: SiteType;
}
