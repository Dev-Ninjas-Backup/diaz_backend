import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateContactPageDto {
  @ApiProperty({
    example: 'Contact Us',
    description: 'Title of the Contact Us section',
    required: false,
  })
  @IsString()
  @IsOptional()
  contactTitle?: string;

  @ApiProperty({
    example: 'Get in touch with us...',
    description: 'Description content of the Contact Us section',
    required: false,
  })
  @IsString()
  @IsOptional()
  contactDescription?: string;
}
