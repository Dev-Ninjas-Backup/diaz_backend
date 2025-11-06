import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';
import { BoatsInfoOnBoardingDto } from './boats-info.dto';
import { SellerInfoOnBoardingDto } from './seller-info.dto';

export class SellerOnBoardingDto {
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

  @ApiProperty({ type: BoatsInfoOnBoardingDto })
  @ValidateNested()
  @Type(() => BoatsInfoOnBoardingDto)
  boatInfo: BoatsInfoOnBoardingDto;

  @ApiProperty({ type: SellerInfoOnBoardingDto })
  @ValidateNested()
  @Type(() => SellerInfoOnBoardingDto)
  sellerInfo: SellerInfoOnBoardingDto;

  @ApiProperty({
    description: 'Subscription Plan Id',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  planId: string;
}

export class SellerOnboardingPlanDto {
  @ApiProperty({
    description: 'Subscription Plan Id',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  planId: string;
}

export class SellerOnboardingBodyDto {
  @ApiProperty({
    description: 'Subscription Plan Id',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  planId: string;

  @ApiProperty({ type: BoatsInfoOnBoardingDto })
  @ValidateNested()
  @Type(() => BoatsInfoOnBoardingDto)
  boatInfo: BoatsInfoOnBoardingDto;

  @ApiProperty({ type: SellerInfoOnBoardingDto })
  @ValidateNested()
  @Type(() => SellerInfoOnBoardingDto)
  sellerInfo: SellerInfoOnBoardingDto;
}

export class SellerOnboardingFilesDto {
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
}
