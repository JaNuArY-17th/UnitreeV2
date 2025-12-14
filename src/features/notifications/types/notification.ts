export interface notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  type: string;
  url: string;
  createAt: string;
  updateAt: string;
  data: null;
}

// UI layer specific enriched types (mapped from backend notification)
export type NotificationType = 'deposit' | 'sell' | 'buy' | 'price' | 'email' | 'verify';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  time: string; // formatted or raw string
  unread?: boolean;
  createdAt: string;
}

export interface notificationResponse {
  success: boolean;
  message: string;
  data: {
    notification: notification[];
    totalItems: number,
		countRead: number,
		totalPages: number,
		currentPage: number,
		countUnread: number
  }
  code: number;
}

export interface notificationParams {
  page?: number;
  limit?: number;
  app_id?: number;
  isRealFilter?: string;
  search?: string;
  forceRefresh?: boolean;
}

export interface markAllNotificationParams {
  app_id: number
}

export interface markNotificationResponse {
  success: boolean;
  data: string;
  message: string;
  code: number;
}
