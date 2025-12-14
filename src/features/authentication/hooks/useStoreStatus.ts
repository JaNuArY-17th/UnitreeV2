import { useStoreData } from './useStoreData';

export type StoreStatus = 'APPROVED' | 'PENDING' | 'LOCKED';

export function useStoreStatus() {
  const { storeData, isLoading, error, refetch } = useStoreData();

  const storeStatus = storeData?.status as StoreStatus | undefined;
  const isApproved = storeStatus === 'APPROVED';
  const isPending = storeStatus === 'PENDING';
  const isLocked = storeStatus === 'LOCKED';

  return {
    storeStatus,
    isApproved,
    isPending,
    isLocked,
    isLoading,
    refetch,
    error,
    storeData,
  };
}