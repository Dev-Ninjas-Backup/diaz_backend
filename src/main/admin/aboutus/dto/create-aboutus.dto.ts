import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateAboutUsDto {
  @ApiProperty({
    example: 'About Us',
    description: 'Title of the About Us section',
  })
  @IsString()
  aboutTitle: string;

  @ApiProperty({
    example: 'These are the about...',
    description: 'Description content of the About Us section',
  })
  @IsString()
  aboutDescription: string;
}
