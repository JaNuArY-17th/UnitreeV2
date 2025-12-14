
import { useInfiniteQuery } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';
import type { notificationParams, notificationResponse } from '../types/notification';

export const NOTIFICATION_QUERY_KEYS = {
  all: ['notifications'] as const,
  list: (filter?: string, search?: string) => ['notifications', filter, search] as const,
};

export const useNotifications = (params: Omit<notificationParams, 'page'>) => {
  return useInfiniteQuery<notificationResponse, Error>({
    queryKey: NOTIFICATION_QUERY_KEYS.list(params.isRealFilter, params.search),
    queryFn: ({ pageParam = 1 }) =>
      notificationService.getMyNotification({ ...params, page: pageParam as number }),
    getNextPageParam: (lastPage) => {
      // Handle case where lastPage or lastPage.data is undefined
      if (!lastPage?.data) {
        return undefined;
      }
      const { currentPage, totalPages } = lastPage.data;
      // Ensure currentPage and totalPages are valid numbers
      if (typeof currentPage !== 'number' || typeof totalPages !== 'number') {
        return undefined;
      }
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 30 * 1000, // 30 seconds - notifications are fresh for 30 seconds
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache
    // Stale-while-revalidate: show cached data but refetch in background when stale
    refetchOnMount: true, // Refetch on mount if stale (shows cached first)
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
};
