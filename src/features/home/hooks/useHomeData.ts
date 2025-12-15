import React, { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { useAccountType } from '@/features/authentication/hooks/useAccountType';
import { useStoreData } from '@/features/authentication/hooks';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { useVerificationStatus } from '@/features/authentication';
import { useStoreStatus } from '@/features/authentication/hooks/useStoreStatus';

export const useHomeData = () => {
  const queryClient = useQueryClient();
  const { userData } = useAccountType();
  const { storeData, hasStore, isLoading: isStoreDataLoading } = useStoreData();
  const { verificationStatus } = useVerificationStatus();
  const { storeStatus } = useStoreStatus();

  // Notifications
  const { data: notificationData } = useNotifications({ isRealFilter: 'ALL', limit: 1 });
  const unreadNotificationCount = notificationData?.pages[0]?.data?.countUnread || 0;

  // Refetch on focus
  useFocusEffect(
    useCallback(() => {
      // Refetch store queries if user has a store
      if (hasStore === true) {
        queryClient.invalidateQueries({
          queryKey: ['store'],
          refetchType: 'active'
        });
      }
    }, [queryClient, hasStore])
  );

  return {
    userData,
    storeData,
    hasStore,
    isStoreDataLoading,
    verificationStatus,
    storeStatus,
    unreadNotificationCount,
  };
};
