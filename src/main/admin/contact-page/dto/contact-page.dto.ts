import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateContactPageDto {
  @ApiProperty({
    example: 'Contact - Florida Location',
    description: 'Title of the contact',
  })
  @IsString()
  contactTitle: string;

  @ApiProperty()
  @IsString()
  contactDiscription: string;
}
