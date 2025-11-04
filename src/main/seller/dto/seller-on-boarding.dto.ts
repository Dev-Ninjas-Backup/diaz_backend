import { ApiPropertyOptional } from '@nestjs/swagger';

export class SellerInfoOnBoardingDto {
  name: string;
  phone: string;
  country: string;
  city: string;
  state: string;
  zip: string;

  // Authentication Details
  email: string;
  username: string;
  password: string;
}

export class BoatsInfoOnBoardingDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Cover Images to upload',
    isArray: true,
  })
  covers?: Express.Multer.File[];

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Gallery Images to upload',
    isArray: true,
  })
  galleries?: Express.Multer.File[];
}

export class SellerOnBoardingDto {
  sellerInfo: SellerInfoOnBoardingDto;
  boatsInfo: BoatsInfoOnBoardingDto;
}
