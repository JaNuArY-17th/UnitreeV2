import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { STORE_QUERY_KEYS, setPersistedHasStore } from '@/features/authentication/hooks/useStoreData';
import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

/**
 * Map notification titles để detect store status changes
 */
const STORE_STATUS_NOTIFICATIONS = {
  'Cửa hàng được phê duyệt': 'ACTIVE',
  'Cửa hàng bị tạm khóa': 'LOCKED',
  'Cửa hàng được mở khóa': 'ACTIVE',
} as const;

type StoreStatus = typeof STORE_STATUS_NOTIFICATIONS[keyof typeof STORE_STATUS_NOTIFICATIONS];

/**
 * Hook để xử lý cập nhật store status từ FCM notifications
 * Khi nhận notification từ server về thay đổi store status,
 * sẽ tự động update cache và AsyncStorage
 */
export const useStoreStatusUpdate = (remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!remoteMessage) return;

    const notificationTitle = remoteMessage.notification?.title;
    const notificationType = remoteMessage.data?.type;

    console.log('[useStoreStatusUpdate] Processing notification:', {
      title: notificationTitle,
      type: notificationType,
    });

    // Check if this is a store_management notification
    if (notificationType !== 'store_management') {
      return;
    }

    // Map notification title to store status
    const newStatus = STORE_STATUS_NOTIFICATIONS[notificationTitle as keyof typeof STORE_STATUS_NOTIFICATIONS];

    if (!newStatus) {
      console.log('[useStoreStatusUpdate] Unknown store status notification:', notificationTitle);
      return;
    }

    console.log('[useStoreStatusUpdate] Detected store status change to:', newStatus);

    // Update store data cache with new status
    try {
      const currentCachedData = queryClient.getQueryData(STORE_QUERY_KEYS.storeData());
      
      if (currentCachedData) {
        console.log('[useStoreStatusUpdate] Updating cached store data with new status');
        
        // Update cache with new status
        queryClient.setQueryData(STORE_QUERY_KEYS.storeData(), (oldData: any) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            data: {
              ...oldData.data,
              status: newStatus,
            },
          };
        });

        console.log('[useStoreStatusUpdate] ✅ Cache updated successfully');
      }

      // If store became ACTIVE, ensure AsyncStorage reflects it has a store
      if (newStatus === 'ACTIVE') {
        setPersistedHasStore(true).then(() => {
          console.log('[useStoreStatusUpdate] ✅ AsyncStorage updated: hasStore = true');
          // Invalidate queries to ensure UI refreshes
          queryClient.invalidateQueries({ 
            queryKey: ['store', 'hasStoreFromStorage'] 
          });
        }).catch(error => {
          console.error('[useStoreStatusUpdate] ❌ Failed to update AsyncStorage:', error);
        });
      } else {
        // For other statuses, just invalidate the queries
        queryClient.invalidateQueries({ 
          queryKey: ['store', 'hasStoreFromStorage'] 
        });
      }

    } catch (error) {
      console.error('[useStoreStatusUpdate] Error updating store status:', error);
    }
  }, [remoteMessage, queryClient]);
};
