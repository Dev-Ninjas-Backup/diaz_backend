import { BoatEngine, BoatImage, Boats, FileInstance } from '@prisma/client';

export type ListingForGmc = Boats & {
  engines: BoatEngine[];
  images: (BoatImage & { file: FileInstance })[];
};

export interface SyncBoatsWithGmcPayload {
  listingId: string;
  listing: ListingForGmc;
}
