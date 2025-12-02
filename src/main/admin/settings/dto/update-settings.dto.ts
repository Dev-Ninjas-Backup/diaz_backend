import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Currency } from 'generated/enums';

export class UpdateSettingsDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  siteName?: string;

  @ApiPropertyOptional({ enum: Currency, example: 'USD', required: false })
  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;

  @ApiPropertyOptional({ type: Boolean, required: false })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined) return value;
    if (typeof value === 'string') {
      const v = value.trim().toLowerCase();
      if (v === 'true' || v === '1' || v === 'on') return true;
      if (v === 'false' || v === '0' || v === 'off') return false;
    }
    return Boolean(value);
  })
  maintenanceMode?: boolean;

  @ApiPropertyOptional({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  logo?: Express.Multer.File;

  @ApiPropertyOptional({ type: Boolean, required: false })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined) return value;
    if (typeof value === 'string') {
      const v = value.trim().toLowerCase();
      if (v === 'true' || v === '1' || v === 'on') return true;
      if (v === 'false' || v === '0' || v === 'off') return false;
    }
    return Boolean(value);
  })
  newListingSubmitted?: boolean;

  @ApiPropertyOptional({ type: Boolean, required: false })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined) return value;
    if (typeof value === 'string') {
      const v = value.trim().toLowerCase();
      if (v === 'true' || v === '1' || v === 'on') return true;
      if (v === 'false' || v === '0' || v === 'off') return false;
    }
    return Boolean(value);
  })
  newSellerRegistration?: boolean;
}
