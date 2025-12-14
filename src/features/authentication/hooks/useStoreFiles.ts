import { useQuery } from '@tanstack/react-query';
import { storeService } from '../services/storeService';

export const STORE_FILES_QUERY_KEYS = {
  all: ['storeFiles'] as const,
  byStoreId: (storeId: string) => [...STORE_FILES_QUERY_KEYS.all, storeId] as const,
};

export interface StoreFile {
  fileId: string;
  fileUrl: string;
}

export function useStoreFiles(storeId: string | undefined) {
  return useQuery({
    queryKey: STORE_FILES_QUERY_KEYS.byStoreId(storeId || ''),
    queryFn: async () => {
      if (!storeId) {
        throw new Error('Store ID is required');
      }
      const response = await storeService.getStoreFiles(storeId);
      return response;
    },
    enabled: !!storeId, // Only fetch if storeId exists
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
