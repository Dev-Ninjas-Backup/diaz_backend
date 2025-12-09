import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateBannerDto } from './create-banner.dto';

export class UpdateBannerDto extends PartialType(CreateBannerDto) {
  @IsOptional()
  @IsString()
  backgroundId?: string;
}
