import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ValidatePromoCodeDto {
  @ApiProperty({
    description: 'The promo code to validate',
    example: 'FREE30',
  })
  @IsString()
  code: string;
}
