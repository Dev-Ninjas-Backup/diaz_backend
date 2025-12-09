import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { SiteType } from 'generated/client';

export class GetFeaturedBrandQueryDto {
  @ApiProperty({ enum: SiteType, example: 'FLORIDA', required: true })
  @IsEnum(SiteType)
  site: SiteType;
}
