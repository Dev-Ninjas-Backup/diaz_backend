import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PageType, SiteType } from 'generated/client';

export class CreateBannerDto {
  @ApiProperty({ enum: PageType, example: 'HOME', required: true })
  @IsEnum(PageType)
  page: PageType;

  @ApiProperty({ enum: SiteType, example: 'FLORIDA', required: true })
  @IsEnum(SiteType)
  site: SiteType;

  @ApiProperty()
  @IsString()
  bannerTitle: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  background?: Express.Multer.File;
}
