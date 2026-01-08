import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { CreateBoatsInfoDto } from './boats-info.dto';
import { SellerInfoOnBoardingDto } from './seller-info.dto';

export class SellerOnboardingPlanDto {
  @ApiProperty({
    description: 'Subscription Plan Id',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  planId: string;

  @ApiPropertyOptional({
    description: 'Promo Code',
    example: 'FREE30',
  })
  @IsString()
  promoCode?: string;
}

export class SellerOnBoardingDto extends SellerOnboardingPlanDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description:
      'Cover Images to upload (multipart file). Use this field when uploading files.',
    isArray: true,
  })
  covers?: Express.Multer.File[];

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description:
      'Gallery Images to upload (multipart file). Use this field when uploading files.',
    isArray: true,
  })
  galleries?: Express.Multer.File[];

  @ApiProperty({ type: CreateBoatsInfoDto })
  @ValidateNested()
  @Type(() => CreateBoatsInfoDto)
  boatInfo: CreateBoatsInfoDto;

  @ApiProperty({ type: SellerInfoOnBoardingDto })
  @ValidateNested()
  @Type(() => SellerInfoOnBoardingDto)
  sellerInfo: SellerInfoOnBoardingDto;
}

export class SellerOnboardingBodyDto extends SellerOnboardingPlanDto {
  @ApiProperty({ type: CreateBoatsInfoDto })
  @ValidateNested()
  @Type(() => CreateBoatsInfoDto)
  boatInfo: CreateBoatsInfoDto;

  @ApiProperty({ type: SellerInfoOnBoardingDto })
  @ValidateNested()
  @Type(() => SellerInfoOnBoardingDto)
  sellerInfo: SellerInfoOnBoardingDto;
}
