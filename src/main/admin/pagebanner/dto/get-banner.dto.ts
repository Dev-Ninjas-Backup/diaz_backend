import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { PageType, SiteType } from 'generated/client';

export class GetBannerQueryDto {
  @ApiProperty({ enum: PageType, example: 'HOME', required: true })
  @IsEnum(PageType)
  page: PageType;

  @ApiProperty({ enum: SiteType, example: 'FLORIDA', required: true })
  @IsEnum(SiteType)
  site: SiteType;
}
