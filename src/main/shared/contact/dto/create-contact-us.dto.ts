import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateContactUsDto {
  @ApiProperty({
    description: 'Full name of the contact',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @ApiProperty({
    description: 'Phone number of the contact',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  @ApiProperty({
    description: 'Email address of the contact',
    example: 'john@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @ApiPropertyOptional({
    description: 'Boat information (optional)',
    example: 'Interested in a 2020 Sea Ray Sundancer',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  boatInformation?: string;

  @ApiPropertyOptional({
    description: 'Additional comments (optional)',
    example: 'I would like to schedule a viewing.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comments?: string;
}
