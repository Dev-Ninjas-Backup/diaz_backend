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

  @ApiProperty({
    example: 'Our mission is to make yacht trading effortless and accessible.',
    description: 'Mission statement',
  })
  @IsString()
  mission: string;

  @ApiProperty({
    example: 'To be the premier yacht trading platform in the nation.',
    description: 'Vision statement',
  })
  @IsString()
  vision: string;
}
