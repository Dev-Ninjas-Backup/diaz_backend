import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

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
}
