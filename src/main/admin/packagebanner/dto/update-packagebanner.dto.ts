import { PartialType } from '@nestjs/swagger';
import { CreatePackageBannerDto } from './create-packagebanner.dto';

export class UpdatePackageBannerDto extends PartialType(
  CreatePackageBannerDto,
) {}
