import { BoatImageType } from '@prisma/client';

export interface ListingImageProcessPayload {
  listingId: string;
  imageType: BoatImageType;
  imageFiles: Express.Multer.File[];
}
