import { BoatImageType } from '@prisma/client';

export interface ListingImageProcessPayload {
  userId: string;
  listingId: string;
  imageType: BoatImageType;
  imageFiles: Express.Multer.File[];
}
