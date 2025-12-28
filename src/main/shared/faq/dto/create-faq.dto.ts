import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { SiteType } from 'generated/client';
import { FaqQuestionDto } from './faq-question.dto';

export class CreateFaqDto {
  @ApiProperty({
    description: 'Site type',
    enum: SiteType,
    example: SiteType.FLORIDA,
  })
  @IsEnum(SiteType)
  @IsNotEmpty()
  site: SiteType;

  @ApiProperty({
    description: 'FAQ section title',
    example: 'Frequently Asked Questions',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'FAQ section subtitle',
    example: 'Find answers to common questions',
  })
  @IsString()
  @IsOptional()
  subtitle?: string;

  @ApiProperty({
    description: 'Array of questions and answers',
    type: [FaqQuestionDto],
    example: [
      {
        question: 'What are your business hours?',
        answer: 'We are open Monday to Friday, 9 AM to 5 PM EST.',
      },
      {
        question: 'How can I contact support?',
        answer:
          'You can reach us at support@example.com or call (555) 123-4567.',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaqQuestionDto)
  @ArrayMinSize(1)
  questions: FaqQuestionDto[];
}
