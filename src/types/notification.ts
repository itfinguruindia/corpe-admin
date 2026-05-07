export type NotificationType =
  | "client.status_changed"
  | "client.assigned"
  | "client.registered"
  | "ticket.created"
  | "ticket.status_changed"
  | "ticket.assigned"
  | "payment.received"
  | "payment.failed"
  | "chat.new_message"
  | "document.uploaded"
  | "document.verified"
  | "name.status_changed"
  | "admin.registered"
  | "admin.role_changed"
  | "admin.status_changed";

export type NotificationCategory = "clients" | "tickets" | "payments" | "messages" | "documents" | "admin" | "system";

export type NotificationSeverity = "info" | "warning" | "critical";

export interface Notification {
  _id: string;
  type: NotificationType;
  title: string;
  body: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  isRead: boolean;
  readAt?: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface NotificationPreference {
  admin: string;
  emailDigest: boolean;
  soundEnabled: boolean;
  mutedCategories: NotificationCategory[];
  mutedTypes: NotificationType[];
  chatThrottleSeconds: number;
}

export interface NotificationState {
  unreadCount: number;
  recentNotifications: Notification[];
  preferences: NotificationPreference | null;
  loading: boolean;
}
