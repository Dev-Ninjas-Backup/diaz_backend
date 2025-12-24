import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateContactPageDto {
  @ApiProperty({
    example: 'Contact Us',
    description: 'Title of the Contact Us section',
  })
  @IsString()
  contactTitle: string;

  @ApiProperty({
    example: 'Get in touch with us...',
    description: 'Description content of the Contact Us section',
  })
  @IsString()
  contactDescription: string;
}
