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
  LISTING_IMAGE_PROCESSING = 'queue:listing_image_processing',
  LISTING_IMAGE_DELETING = 'queue:listing_image_deleting',

  // === Adopt boats data events ===
  ADOPT_BOATS_SPECIFICATION = 'queue:adopt_boats_specification',
  ADOPT_BOATS_FEATURES = 'queue:adopt_boats_features',
}
