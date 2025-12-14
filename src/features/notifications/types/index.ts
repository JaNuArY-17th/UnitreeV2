export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'transaction' | 'system' | 'promotion' | 'alert';
  isRead: boolean;
  createdAt: string;
  data?: any;
}

export interface NotificationListResponse {
  data: {
    items: Notification[];
    totalItems: number;
    countUnread: number;
    countRead: number;
    page: number;
    limit: number;
  };
}

export interface SpeakerNotificationSettings {
  enabled: boolean;
  backgroundEnabled: boolean;
  messageTemplate: string;
  volume: number;
  pitch: number;
  rate: number;
  language: string;
}

export interface TransactionNotificationData {
  amount: string;
  sender: string;
  time: string;
  bankName: string;
  transactionId?: string;
  description?: string;
}
