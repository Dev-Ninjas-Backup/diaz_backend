import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
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
}

export class SellerOnboardingBodyDto {
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
