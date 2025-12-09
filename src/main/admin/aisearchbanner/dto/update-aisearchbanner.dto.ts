import { PartialType } from '@nestjs/swagger';
import { CreateAISearchBannerDto } from './create-aisearchbanner.dto';

export class UpdateAISearchBannerDto extends PartialType(
  CreateAISearchBannerDto,
) {}
