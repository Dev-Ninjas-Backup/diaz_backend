import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  Length,
  IsUrl,
  IsEnum,
  IsPhoneNumber,
  Matches,
} from 'class-validator';
import { UserStatus } from 'generated/enums';

export class UpdateSellerDto {
  // === Profile ===
  @ApiProperty({
    description: "Seller's full name",
    example: 'John Marine',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  name?: string;

  @ApiProperty({
    description: 'Username (must be unique)',
    example: 'johnmarine',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(3, 30)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username?: string;

  @ApiProperty({
    description: 'Email address (must be unique)',
    example: 'john@boats.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Phone number (E.164 format recommended)',
    example: '+12025550123',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Invalid phone number' })
  phone?: string;

  @ApiProperty({
    description: 'Profile picture URL',
    example: 'https://example.com/avatars/john.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: 'Invalid URL for avatar' })
  avatarUrl?: string;

  // === Address ===
  @ApiProperty({ example: 'United States', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: 'Miami', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'Florida', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: '33139', required: false })
  @IsOptional()
  @IsString()
  @Length(4, 10)
  zip?: string;

  // === Account Status (Admin only) ===
  @ApiProperty({
    enum: UserStatus,
    description: 'Only admins can change status',
    example: 'ACTIVE',
    required: false,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
