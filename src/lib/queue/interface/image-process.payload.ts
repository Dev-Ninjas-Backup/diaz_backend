import { BoatImageType } from '@prisma/client';

export interface QueueFile {
  path: string; // temp file path
  type: BoatImageType; // track which category
  originalName: string; // original file name
}

export interface ListingImageProcessPayload {
  userId: string;
  listingId: string;
  files: QueueFile[];
}

export interface ListingImageDeletePayload {
  userId: string;
  listingId: string;
  imagesToDelete: string[];
}
