import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SellerInfoOnBoardingDto {
  @ApiProperty({
    example: 'Sajib Hossen',
    description: 'Full name of the seller',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: '+8801XXXXXXXXX',
    description: 'Phone number in international format',
  })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'Bangladesh' })
  @IsString()
  country: string;

  @ApiProperty({ example: 'Dhaka' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Dhaka' })
  @IsString()
  state: string;

  @ApiProperty({ example: '1207' })
  @IsString()
  zip: string;

  // Authentication Details
  @ApiProperty({ example: 'seller@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'seller_username' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'strongPassword123!' })
  @IsString()
  password: string;
}
