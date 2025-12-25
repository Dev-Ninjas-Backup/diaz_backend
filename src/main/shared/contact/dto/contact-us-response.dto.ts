import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SiteType } from 'generated/enums';

export class ContactPageDataDto {
  @ApiProperty({ description: 'Contact page ID', example: 'uuid' })
  id: string;

  @ApiProperty({
    enum: SiteType,
    description: 'Site type',
    example: SiteType.FLORIDA,
  })
  site: SiteType;

  @ApiPropertyOptional({
    description: 'Contact page title',
    example: 'Contact Us',
  })
  contactTitle?: string;

  @ApiPropertyOptional({
    description: 'Contact page description',
    example: 'Get in touch with us...',
  })
  contactDescription?: string;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}

export class FormFieldDto {
  @ApiProperty({ description: 'Field label', example: 'Full Name' })
  label: string;

  @ApiProperty({ description: 'Field type', example: 'text' })
  type: string;

  @ApiProperty({ description: 'Whether field is required', example: true })
  required: boolean;

  @ApiPropertyOptional({
    description: 'Field placeholder',
    example: 'John Doe',
  })
  placeholder?: string;

  @ApiPropertyOptional({ description: 'Maximum length', example: 255 })
  maxLength?: number;

  @ApiPropertyOptional({
    description: 'Field description',
    example: 'Full name of the contact',
  })
  description?: string;
}

export class ContactUsFormFieldsDto {
  @ApiProperty({
    type: () => FormFieldDto,
    description: 'Full name field configuration',
  })
  fullName: FormFieldDto;

  @ApiProperty({
    type: () => FormFieldDto,
    description: 'Phone field configuration',
  })
  phone: FormFieldDto;

  @ApiProperty({
    type: () => FormFieldDto,
    description: 'Email field configuration',
  })
  email: FormFieldDto;

  @ApiPropertyOptional({
    type: () => FormFieldDto,
    description: 'Boat information field configuration',
  })
  boatInformation?: FormFieldDto;

  @ApiPropertyOptional({
    type: () => FormFieldDto,
    description: 'Comments field configuration',
  })
  comments?: FormFieldDto;
}

export class ContactUsResponseDataDto {
  @ApiPropertyOptional({
    type: () => ContactPageDataDto,
    description: 'Contact page data for the specified site',
    nullable: true,
  })
  contactPage: ContactPageDataDto | null;

  @ApiProperty({
    type: () => ContactUsFormFieldsDto,
    description: 'Form field configurations',
  })
  formFields: ContactUsFormFieldsDto;

  @ApiProperty({
    description: 'API endpoint for submitting the form',
    example: '/contact/contact-us',
  })
  endpoint: string;

  @ApiProperty({ description: 'HTTP method', example: 'POST' })
  method: string;

  @ApiProperty({
    description: 'Message',
    example: 'Contact Us form information',
  })
  message: string;
}

export class ContactUsResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Contact Us form information retrieved successfully',
  })
  message: string;

  @ApiProperty({
    type: () => ContactUsResponseDataDto,
    description: 'Response data',
  })
  data: ContactUsResponseDataDto;
}

export class CreateContactUsResponseDataDto {
  @ApiProperty({ description: 'Contact ID', example: 'uuid' })
  id: string;

  @ApiProperty({
    description: 'Success message',
    example: 'Thank you for contacting us! We will get back to you soon.',
  })
  message: string;
}

export class CreateContactUsResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Contact form submitted successfully',
  })
  message: string;

  @ApiProperty({
    type: () => CreateContactUsResponseDataDto,
    description: 'Response data',
  })
  data: CreateContactUsResponseDataDto;
}
