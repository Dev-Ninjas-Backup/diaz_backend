import { BoatsSourceEnum } from '@/common/enum/boats-source.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ContactSource, ContactType } from 'generated/client';

export class CreateContactDto {
  @ApiProperty({ description: 'Name of the contact', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Email of the contact',
    example: 'john@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Phone number of the contact',
    example: '+1234567890',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'Message from the contact',
    example: 'I am interested in your listing.',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    enum: ContactSource,
    description: 'Source of the contact',
    example: ContactSource.FLORIDA,
  })
  @IsEnum(ContactSource)
  source: ContactSource;

  @ApiProperty({
    enum: ContactType,
    description: 'Type of the contact',
    example: ContactType.GLOBAL,
  })
  @IsEnum(ContactType)
  type: ContactType;

  @ApiPropertyOptional({
    description: 'Associated listing ID if applicable',
    example: 'listing',
  })
  @IsOptional()
  @IsString()
  listingId?: string;

  @ApiPropertyOptional({
    enum: BoatsSourceEnum,
    description: 'Source of the listing',
    example: BoatsSourceEnum.inventory,
  })
  @IsOptional()
  @IsEnum(BoatsSourceEnum)
  listingSource?: BoatsSourceEnum;
}
