import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { SiteType } from 'generated/client';

export class UnsubscribeEmailDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address to unsubscribe',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    enum: SiteType,
    example: SiteType.FLORIDA,
    description: 'Site to unsubscribe from',
  })
  @IsEnum(SiteType)
  @IsNotEmpty()
  site: SiteType;
}
