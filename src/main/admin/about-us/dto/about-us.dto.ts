import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateAboutUsDto {
  @ApiProperty({
    example: 'About Us - Florida Location',
    description: 'Title of the About US',
  })
  @IsString()
  aboutBottomTitle: string;

  @ApiProperty()
  @IsString()
  aboutBottomSubTitle: string;
}
