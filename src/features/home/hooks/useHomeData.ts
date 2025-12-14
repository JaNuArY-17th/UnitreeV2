import React, { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { useStoreBankAccountData, useBankAccount, useBankTypeManager } from '@/features/deposit/hooks';
import { usePostpaidData } from '@/features/account/hooks';
import { useAccountType } from '@/features/authentication/hooks/useAccountType';
import { useStoreData } from '@/features/authentication/hooks';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { useVerificationStatus } from '@/features/authentication';
import { useStoreStatus } from '@/features/authentication/hooks/useStoreStatus';
import { useDashboardReport } from '@/features/report/hooks';
import { BANK_QUERY_KEYS } from '@/features/deposit/hooks/useBankAccount';

export const useHomeData = () => {
  const queryClient = useQueryClient();
  const { userData } = useAccountType();
  const { storeData, hasStore, isLoading: isStoreDataLoading } = useStoreData();
  const { verificationStatus } = useVerificationStatus();
  const { storeStatus } = useStoreStatus();
  const { currentBankType } = useBankTypeManager();

  // Notifications
  const { data: notificationData } = useNotifications({ isRealFilter: 'ALL', limit: 1 });
  const unreadNotificationCount = notificationData?.pages[0]?.data?.countUnread || 0;

  // Dashboard Report
  const [selectedDateRange, setSelectedDateRange] = useState<any>(null);

  useEffect(() => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const defaultRange = {
      startDate: startOfMonth,
      endDate: today,
    };
    setSelectedDateRange(defaultRange);
  }, []);

  const dashboardParams = selectedDateRange ? {
    fromDate: `${selectedDateRange.startDate.getDate().toString().padStart(2, '0')}/${(selectedDateRange.startDate.getMonth() + 1).toString().padStart(2, '0')}/${selectedDateRange.startDate.getFullYear()}`,
    toDate: `${selectedDateRange.endDate.getDate().toString().padStart(2, '0')}/${(selectedDateRange.endDate.getMonth() + 1).toString().padStart(2, '0')}/${selectedDateRange.endDate.getFullYear()}`
  } : null;

  // Only call store dashboard when:
  // 1. We have valid date params
  // 2. hasStore is explicitly true (not undefined or false)
  // 3. User is currently operating in STORE bank mode
  const shouldFetchDashboard = !!dashboardParams && hasStore === true && currentBankType === 'STORE';

  const { data: dashboardData, refetch: refetchDashboard, isLoading: isDashboardLoading } = useDashboardReport(
    dashboardParams || { fromDate: '', toDate: '' },
    shouldFetchDashboard
  );

  // Bank Account
  const {
    data: bankAccountData,
    isLoading: isFetchingBankAccount,
    refetch: refetchBankAccount
  } = useBankAccount(currentBankType || undefined);

  const {
    bankBalance,
    bankNumber,
    bankCurrency,
    isLoading: isBankDataLoading,
    hasAccount,
  } = useStoreBankAccountData();

  // Postpaid
  const { data: postpaidData, isLoading: isPostpaidLoading } = usePostpaidData({ enabled: !!userData && currentBankType === 'USER' });

  // Refetch on focus - only refetch if data is stale, not every time
  // This prevents excessive API calls when navigating between screens
  useFocusEffect(
    useCallback(() => {
      // Only refetch bank account if the query is stale (exceeded staleTime)
      // The queries have staleTime of 15 minutes, so they won't refetch unnecessarily
      if (currentBankType) {
        const queryState = queryClient.getQueryState(BANK_QUERY_KEYS.account(currentBankType));
        const isStale = !queryState || queryState.dataUpdatedAt === 0 ||
          Date.now() - queryState.dataUpdatedAt > 30 * 1000; // 30 seconds stale time

        if (isStale) {
          queryClient.invalidateQueries({
            queryKey: BANK_QUERY_KEYS.account(currentBankType),
            refetchType: 'active'
          });
        }
      }

      // Only invalidate store queries if user actually has a store and data is stale
      if (hasStore === true && currentBankType === 'STORE') {
        const storeQueryState = queryClient.getQueryState(['store']);
        const isStoreStale = !storeQueryState || storeQueryState.dataUpdatedAt === 0 ||
          Date.now() - storeQueryState.dataUpdatedAt > 15 * 60 * 1000;

        if (isStoreStale) {
          queryClient.invalidateQueries({
            queryKey: ['store'],
            refetchType: 'active'
          });
        }
      }
    }, [queryClient, currentBankType, hasStore])
  );

  return {
    userData,
    storeData,
    hasStore,
    isStoreDataLoading,
    verificationStatus,
    storeStatus,
    currentBankType,
    unreadNotificationCount,
    dashboardData,
    isDashboardLoading,
    bankAccountData,
    isFetchingBankAccount,
    bankBalance,
    bankNumber,
    hasAccount,
    postpaidData,
    isPostpaidLoading,
  };
};
