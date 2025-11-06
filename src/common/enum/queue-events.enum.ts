export enum EventsEnum {
  // === Generic status events ===
  ERROR = 'error', // Server -> Client: operation failed
  SUCCESS = 'success', // Server -> Client: operation succeeded
}

export enum QueueEventsEnum {
  // === Notification events ===
  NOTIFICATION = 'queue:notification',
  MESSAGES = 'queue:messages',

  // === Image processing events ===
  COVER_IMAGE_PROCESSING = 'queue:cover_image_processing',
  GALLERY_IMAGE_PROCESSING = 'queue:gallery_image_processing',
}
