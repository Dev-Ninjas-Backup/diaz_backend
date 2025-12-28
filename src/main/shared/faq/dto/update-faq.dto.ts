import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { FaqQuestionDto } from './faq-question.dto';

export class UpdateFaqDto {
  @ApiPropertyOptional({
    description: 'FAQ section title',
    example: 'Frequently Asked Questions',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'FAQ section subtitle',
    example: 'Find answers to common questions',
  })
  @IsString()
  @IsOptional()
  subtitle?: string;

  @ApiPropertyOptional({
    description: 'Array of questions and answers',
    type: [FaqQuestionDto],
    example: [
      {
        question: 'What are your business hours?',
        answer: 'We are open Monday to Friday, 9 AM to 5 PM EST.',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaqQuestionDto)
  @ArrayMinSize(1)
  @IsOptional()
  questions?: FaqQuestionDto[];
}
