import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FaqQuestionDto {
  @ApiProperty({
    description: 'Question text',
    example: 'What are your business hours?',
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    description: 'Answer text',
    example: 'We are open Monday to Friday, 9 AM to 5 PM EST.',
  })
  @IsString()
  @IsNotEmpty()
  answer: string;
}
