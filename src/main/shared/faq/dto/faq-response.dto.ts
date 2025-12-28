import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SiteType } from 'generated/client';
import { FaqQuestionDto } from './faq-question.dto';

export class FaqDataDto {
  @ApiProperty({ example: 'uuid-string' })
  id: string;

  @ApiProperty({ enum: SiteType, example: SiteType.FLORIDA })
  site: SiteType;

  @ApiProperty({ example: 'Frequently Asked Questions' })
  title: string;

  @ApiPropertyOptional({ example: 'Find answers to common questions' })
  subtitle?: string;

  @ApiProperty({
    type: [FaqQuestionDto],
    example: [
      {
        question: 'What are your business hours?',
        answer: 'We are open Monday to Friday, 9 AM to 5 PM EST.',
      },
    ],
  })
  questions: FaqQuestionDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class FaqResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'FAQ retrieved successfully' })
  message: string;

  @ApiProperty({ type: FaqDataDto })
  data: FaqDataDto;
}
