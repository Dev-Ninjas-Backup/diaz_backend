import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';
import { BoatListingStatus } from 'generated/client';

export class ListingFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: BoatListingStatus })
  @IsOptional()
  @IsEnum(BoatListingStatus)
  status?: BoatListingStatus;
}
