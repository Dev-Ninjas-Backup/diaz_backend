import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDailyLeadDto {
  @ApiProperty({ example: 'FY271407489' })
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({ example: 'Smith' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'codewonders41@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Viking', required: false })
  @IsString()
  @IsOptional()
  product?: string;

  @ApiProperty({ example: 'not contacted', required: false })
  @IsString()
  @IsOptional()
  status?: string;
}
