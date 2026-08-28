import {
  NotificationChannel,
  NotificationPriority,
  NotificationType,
} from "@prisma/client";

export interface CreateNotificationDTO {
  accountId: string;

  type: NotificationType;
  channel: NotificationChannel;

  priority?: NotificationPriority;

  subject?: string;
  title: string;
  message: string;

  templateId?: string;
  providerId?: string;

  scheduledAt?: Date;
}
