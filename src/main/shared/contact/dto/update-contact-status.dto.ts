import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateContactStatusDto {
  @ApiProperty({
    description: 'Contact status',
    example: 'Contacted',
  })
  @IsString()
  @IsNotEmpty()
  status: string;
}
