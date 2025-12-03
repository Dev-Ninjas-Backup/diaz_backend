import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateTermsOfServicesDto {
  @IsString()
  @ApiProperty({
    example: 'Terms of Service',
    description: 'Title of the Terms of Service',
  })
  termsTitle: string;

  @IsString()
  @ApiProperty({
    example: 'These are the terms...',
    description: 'Description of the Terms of Service',
  })
  termsDescription: string;
}
