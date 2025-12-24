import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreatePrivacyPolicyDto {
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
}

export class UpdatePrivacyPolicyDto {
  @ApiPropertyOptional({
    example: 'Privacy Policy - Florida Location',
    description: 'Title of the Privacy Policy',
  })
  @IsString()
  @IsOptional()
  privacyTitle?: string;

  @ApiPropertyOptional({
    example:
      '<h1>Effective Date: December 2025</h1><p>We respect your privacy...</p>',
    description: 'Full content (HTML recommended) of the privacy policy',
  })
  @IsString()
  @IsOptional()
  privacyDescription?: string;
}
