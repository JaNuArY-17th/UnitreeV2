import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePostpaidData, ACCOUNT_QUERY_KEYS } from './usePostpaid';
import { accountService } from '../services/accountService';
import type { TabType } from '../components/TabSelector';

/**
 * Hook to manage API calls and cache updates when switching tabs in AccountManagementScreen
 * Ensures fresh data is fetched when entering specific tabs while maintaining cache
 */
export const useAccountTabData = (activeTab: TabType) => {
  const queryClient = useQueryClient();
  const { data: postpaidData, isLoading: isPostpaidLoading } = usePostpaidData();

  // Handle tab-specific data fetching
  useEffect(() => {
    const handleTabDataFetch = async () => {
      if (activeTab === 'loan') {
        console.log('🔄 [AccountTab] Entering ESP/Loan tab - refreshing postpaid data...');
        
        try {
          // Fetch fresh postpaid data
          const freshPostpaidResponse = await accountService.getMyPostpaid();
          
          if (freshPostpaidResponse.success && freshPostpaidResponse.data) {
            // Update the cache with fresh data
            queryClient.setQueryData(ACCOUNT_QUERY_KEYS.POSTPAID, freshPostpaidResponse);
            console.log('✅ [AccountTab] Fresh postpaid data cached successfully on tab switch');
            console.log('📊 [AccountTab] Updated postpaid data:', {
              dueDate: freshPostpaidResponse.data.dueDate,
              spentCredit: freshPostpaidResponse.data.spentCredit,
              creditLimit: freshPostpaidResponse.data.creditLimit,
            });
          } else {
            console.warn('⚠️ [AccountTab] Fresh postpaid API returned unsuccessful response');
          }
        } catch (error) {
          console.error('❌ [AccountTab] Failed to fetch fresh postpaid data on tab switch:', error);
          // Don't throw error - use cached data if available
        }
      }
    };

    // Only fetch if we're switching to the loan tab
    if (activeTab === 'loan') {
      handleTabDataFetch();
    }
  }, [activeTab, queryClient]);

  return {
    postpaidData,
    isPostpaidLoading,
  };
};