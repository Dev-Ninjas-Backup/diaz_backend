import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateTermsOfServicesDto {
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

export class UpdateTermsOfServicesDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'Terms of Service',
    description: 'Title of the Terms of Service',
  })
  termsTitle?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'These are the terms...',
    description: 'Description of the Terms of Service',
  })
  termsDescription?: string;
}
