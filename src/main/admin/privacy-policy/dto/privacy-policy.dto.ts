import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdatePrivacyPolicyDto {
  @ApiProperty({
    example: 'Privacy Policy - Florida Location',
    description: 'Title of the Privacy Policy',
  })
  @IsString()
  privacyTitle: string;

  @ApiProperty({
    example:
      '<h1>Effective Date: December 2025</h1><p>We respect your privacy...</p>',
    description: 'Full content (HTML recommended) of the privacy policy',
  })
  @IsString()
  privacyDescription: string;
  id: any;
}
