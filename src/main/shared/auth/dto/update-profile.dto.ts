import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsPostalCode, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'John', description: 'Optional name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '1234567890', description: 'Optional phone' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'USA', description: 'Optional country' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 'New York', description: 'Optional city' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'NY', description: 'Optional state' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({
    example: '10001',
    description: 'Optional ZIP/postal code',
  })
  @IsOptional()
  @IsPostalCode('any')
  zip?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Optional profile image',
  })
  @IsOptional()
  image?: Express.Multer.File;
}
