import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { SiteType } from 'generated/enums';

export class ManualRotateFeaturedYachtDto {
  @ApiPropertyOptional({
    enum: SiteType,
    description:
      'Site to rotate featured yacht for. If not provided, rotates for all sites (FLORIDA and JUPITER)',
    example: SiteType.FLORIDA,
  })
  @IsOptional()
  @IsEnum(SiteType)
  site?: SiteType;
}
