import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { BoatsInfoOnBoardingDto } from './boats-info.dto';
import { SellerOnboardingFilesDto } from './seller-on-boarding.dto';

export class UpdateListingDto extends BoatsInfoOnBoardingDto {
  @ApiProperty({
    type: 'array',
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '550e8400-e29b-41d4-a716-446655440001',
    ],
    description: 'UUId of images to delete',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  imagesToDelete: string[];
}

export class UpdateListingDtoWithImagesDto extends PartialType(
  UpdateListingDto,
) {}

export class UpdateListingDtoWithFilesDto extends SellerOnboardingFilesDto {
  @ApiPropertyOptional({ type: UpdateListingDtoWithImagesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateListingDtoWithImagesDto)
  boatInfo: UpdateListingDtoWithImagesDto;
}
