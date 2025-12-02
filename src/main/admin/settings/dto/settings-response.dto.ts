import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { Currency } from 'generated/enums';

export class SettingsResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  siteName: string;

  @ApiProperty({ enum: Currency, example: 'USD', required: false })
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty()
  maintenanceMode: boolean;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  logo?: Express.Multer.File;

  @ApiProperty()
  newListingSubmitted: boolean;

  @ApiProperty()
  newSellerRegistration: boolean;

  @ApiProperty()
  updatedAt: Date;
}
