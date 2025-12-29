import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAboutUsDto {
  @ApiProperty({
    example: 'About Us',
    description: 'Title of the About Us section',
    required: false,
  })
  @IsString()
  @IsOptional()
  aboutTitle?: string;

  @ApiProperty({
    example: 'These are the about...',
    description: 'Description content of the About Us section',
    required: false,
  })
  @IsString()
  @IsOptional()
  aboutDescription?: string;

  @ApiProperty({
    example: 'Our mission is to make yacht trading effortless and accessible.',
    description: 'Mission statement',
    required: false,
  })
  @IsString()
  @IsOptional()
  mission?: string;

  @ApiProperty({
    example: 'To be the premier yacht trading platform in the nation.',
    description: 'Vision statement',
    required: false,
  })
  @IsString()
  @IsOptional()
  vision?: string;
}
