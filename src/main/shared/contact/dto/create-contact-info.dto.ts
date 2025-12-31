import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { SiteType } from 'generated/client';

class WorkingHourDto {
  @ApiProperty({
    description: 'Day of the week',
    example: 'Monday',
  })
  @IsString()
  @IsNotEmpty()
  day: string;

  @ApiProperty({
    description: 'Working hours for the day',
    example: '9am to 5pm',
  })
  @IsString()
  @IsNotEmpty()
  hours: string;
}

class SocialMediaDto {
  @ApiPropertyOptional({
    description: 'Facebook page URL',
    example: 'https://facebook.com/yourpage',
  })
  @IsOptional()
  @IsString()
  facebook?: string;

  @ApiPropertyOptional({
    description: 'LinkedIn page URL',
    example: 'https://linkedin.com/company/yourcompany',
  })
  @IsOptional()
  @IsString()
  linkedin?: string;

  @ApiPropertyOptional({
    description: 'Twitter/X profile URL',
    example: 'https://twitter.com/yourprofile',
  })
  @IsOptional()
  @IsString()
  twitter?: string;

  @ApiPropertyOptional({
    description: 'YouTube channel URL',
    example: 'https://youtube.com/@yourchannel',
  })
  @IsOptional()
  @IsString()
  youtube?: string;
}

export class CreateContactInfoDto {
  @ApiProperty({
    description: 'Physical address',
    example: '11172 184th Court N Jupiter, FL 33478',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'Contact email',
    example: 'monica@floridayachttrader.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Contact phone number',
    example: '954-673-7702',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'Array of working hours',
    type: [WorkingHourDto],
    example: [
      { day: 'Monday', hours: '9am to 5pm' },
      { day: 'Tuesday', hours: '8am to 5pm' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkingHourDto)
  workingHours: WorkingHourDto[];

  @ApiPropertyOptional({
    description: 'Social media links',
    type: SocialMediaDto,
    example: {
      facebook: 'https://facebook.com/yourpage',
      linkedin: 'https://linkedin.com/company/yourcompany',
      twitter: 'https://twitter.com/yourprofile',
      youtube: 'https://youtube.com/@yourchannel',
    },
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SocialMediaDto)
  socialMedia?: SocialMediaDto;

  @ApiPropertyOptional({
    description: 'Background image ID',
    example: 'uuid-here',
  })
  @IsOptional()
  @IsString()
  backgroundImageId?: string;

  @ApiProperty({
    enum: SiteType,
    description: 'Site identifier',
    example: 'FLORIDA',
  })
  @IsEnum(SiteType)
  @IsNotEmpty()
  site: SiteType;
}
