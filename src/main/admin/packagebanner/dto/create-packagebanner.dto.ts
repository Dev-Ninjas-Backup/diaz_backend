import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SiteType } from 'generated/enums';

export class CreatePackageBannerDto {
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
  packageBanner?: any;

  @ApiProperty({
    enum: SiteType,
    example: SiteType.FLORIDA,
    default: SiteType.FLORIDA,
    required: true,
    readOnly: true,
  })
  @IsEnum(SiteType)
  site: SiteType = SiteType.FLORIDA;
}
