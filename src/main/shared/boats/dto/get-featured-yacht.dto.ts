import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { SiteType } from 'generated/enums';

export class GetFeaturedYachtDto {
  @ApiProperty({
    enum: SiteType,
    example: SiteType.FLORIDA,
    description: 'Site to get featured yacht for',
  })
  @IsEnum(SiteType)
  site: SiteType;
}

export class GetFeaturedYachtHistoryDto {
  @ApiPropertyOptional({
    enum: SiteType,
    example: SiteType.FLORIDA,
    description: 'Site to get featured yacht history for',
  })
  @IsOptional()
  @IsEnum(SiteType)
  site?: SiteType;
}
