import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { SiteType } from 'generated/enums';

export class UpdateFeaturedBrandDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Brand logo file',
  })
  featuredbrandLogo?: any;

  @ApiPropertyOptional({ enum: SiteType })
  @IsEnum(SiteType)
  @IsOptional()
  site?: SiteType;
}
