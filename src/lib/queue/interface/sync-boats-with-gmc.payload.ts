import { BoatEngine, BoatImage, Boats, FileInstance } from 'generated/client';

export type ListingForGmc = Boats & {
  engines: BoatEngine[];
  images: (BoatImage & { file: FileInstance })[];
};

export interface SyncBoatsWithGmcPayload {
  listingId: string;
  listing: ListingForGmc;
}
