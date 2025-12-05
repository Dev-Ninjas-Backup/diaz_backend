import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { SiteType } from 'generated/enums';

export class CreateFeaturedBrandDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Brand logo file',
  })
  featuredbrandLogo?: any;

  @ApiProperty({ enum: SiteType, example: 'FLORIDA', required: true })
  @IsEnum(SiteType)
  site: SiteType;
}
