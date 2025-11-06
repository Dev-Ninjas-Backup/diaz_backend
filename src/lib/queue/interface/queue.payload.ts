import { QueueEventsEnum } from '@/common/enum/queue-events.enum';

export interface QueueMeta {
  performedBy: string; // System or Any User
  recordType: string; // Prisma Model
  recordId: string; // Prisma Model Id
  // any other data
  [key: string]: any;
  others?: {
    [key: string]: any;
  };
}

export interface NotificationPayload {
  type: QueueEventsEnum;
  title: string;
  message: string;
  createdAt: Date;
  meta: QueueMeta;
}

export interface QueuePayload extends NotificationPayload {
  recipients: { id: string }[];
}
