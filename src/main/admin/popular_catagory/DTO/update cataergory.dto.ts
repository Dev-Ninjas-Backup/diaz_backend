import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SiteType } from 'generated/enums';

export class CreatePopularCategoryDto {
  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  bannerImg?: any;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({
    enum: SiteType,
    example: SiteType.FLORIDA,
  })
  @IsEnum(SiteType)
  toggle: SiteType;
}

export class UpdatePopularCategoryDto {
  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  bannerImg?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ enum: SiteType })
  @IsOptional()
  @IsEnum(SiteType)
  toggle?: SiteType;
}
