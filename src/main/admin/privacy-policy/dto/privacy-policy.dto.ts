import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdatePrivacyPolicyDto {
  @IsString()
  @ApiProperty({
    example: 'Privacy Policy',
    description: 'Title of the Privacy Policy',
  })
  privacyTitle: string;

  @IsString()
  @ApiProperty({
    example: 'These are the terms...',
    description: 'Description of the Privacy Policy',
  })
  privacyDescription: string;
}
