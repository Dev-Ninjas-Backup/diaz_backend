import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateDailyLeadDto {
  @ApiProperty({ example: 'FY271407489', required: false })
  @IsString()
  @IsOptional()
  user_id?: string;

  @ApiProperty({ example: 'Smith', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'codewonders41@gmail.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'Viking', required: false })
  @IsString()
  @IsOptional()
  product?: string;

  @ApiProperty({ example: 'contacted', required: false })
  @IsString()
  @IsOptional()
  status?: string;
}
