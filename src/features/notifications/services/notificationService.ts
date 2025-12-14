import { apiClient } from '@/shared/utils/axios';
import { API_ENDPOINTS } from '@/shared/config/env';
import type {
  notificationResponse,
  notificationParams,
  markNotificationResponse,
  markAllNotificationParams,
} from '../types/notification';

/**
 * Simplified FCM Device Service - only handles device token registration
 */
class FCMDeviceService {
  /**
   * Register device token with backend - simplified version
   */
  async registerDevice(deviceToken: string): Promise<void> {
    try {
      const payload = {
        fcm_token: deviceToken,
      };

      await apiClient.post('/iam/v1/devices/token', payload);
      console.log('FCM token registered successfully');
    } catch (error) {
      console.error('FCM registration failed:', error);
      throw error;
    }
  }
}

export const fcmDeviceService = new FCMDeviceService();

export const notificationService = {
  // Add registerDevice method to maintain compatibility
  registerDevice: fcmDeviceService.registerDevice.bind(fcmDeviceService),

  /**
   * Get user's notifications
   */
  getMyNotification: async (params: notificationParams): Promise<notificationResponse> => {
    // Apply required defaults while allowing overrides
    const merged: notificationParams = {
      page: 1,
      limit: 10,
      isRealFilter: 'ALL',
      ...params,
    };

    // Manually build query string to ensure it is visible in logs & not stripped
    const query = Object.entries(merged)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&');

    const urlWithQuery = `${API_ENDPOINTS.NOTIFICATION.NOTIFICATIONS}?${query}`;

    const response = await apiClient.get<notificationResponse>(urlWithQuery);
    return response.data as notificationResponse;
  },

  /**
   * Mark a notification as read
   */
  markNotificationAsRead: async (id: string): Promise<markNotificationResponse> => {
    const url = `${API_ENDPOINTS.NOTIFICATION.READ_NOTIFICATION}/${id}`;
    const response = await apiClient.patch<markNotificationResponse>(url);
    return response.data as markNotificationResponse;
  },

  /**
   * Mark all notifications as read
   */
  markAllNotificationsAsRead: async (): Promise<markNotificationResponse> => {
    const response = await apiClient.patch<markNotificationResponse>(
      API_ENDPOINTS.NOTIFICATION.READ_ALL_NOTIFICATIONS,
      undefined,
    );
    return response.data as markNotificationResponse;
  },
};
