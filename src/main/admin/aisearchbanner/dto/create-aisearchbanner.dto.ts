import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SiteType } from 'generated/enums';

export class CreateAISearchBannerDto {
  @ApiProperty()
  @IsString()
  bannerTitle: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Brand logo file',
  })
  aisearchBanner?: any;

  @ApiProperty({
    enum: SiteType,
    example: SiteType.JUPITER,
    default: SiteType.JUPITER,
    required: true,
  })
  @IsEnum(SiteType)
  site: SiteType = SiteType.JUPITER;
}
