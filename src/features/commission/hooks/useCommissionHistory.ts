import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { commissionService } from '../services/commissionService';
import type { CommissionTransaction, GetCommissionTransactionParams } from '../types';

interface UseCommissionHistoryOptions {
  isPaid?: boolean;
  pageSize?: number;
  debounceMs?: number;
}

interface UseCommissionHistoryResult {
  data: CommissionTransaction[];
  loadingInitial: boolean;
  loadingMore: boolean;
  refreshing: boolean;
  error?: any;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
  setPaidFilter: (paid?: boolean) => void;
  isPaidFilter?: boolean;
}

export function useCommissionHistory(opts: UseCommissionHistoryOptions = {}): UseCommissionHistoryResult {
  const {
    isPaid,
    pageSize = 20,
    debounceMs = 300
  } = opts;

  const [data, setData] = useState<CommissionTransaction[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<any>();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isPaidFilter, setIsPaidFilter] = useState<boolean | undefined>(isPaid);

  const hasMore = currentPage < totalPages;
  const debounceRef = useRef<number | null>(null);

  const fetchCommissions = useCallback(async (
    page: number = 1,
    paidFilter?: boolean,
    isLoadMore: boolean = false,
    isRefresh: boolean = false
  ) => {
    try {
      if (!isLoadMore && !isRefresh) setLoadingInitial(true);
      if (isLoadMore) setLoadingMore(true);
      if (isRefresh) setRefreshing(true);

      const params: GetCommissionTransactionParams = {
        page,
        size: pageSize,
        isPaid: paidFilter
      };

      const response = await commissionService.getCommissionTransactions(params);

      if (response.success) {
        const { items, totalPages: total, currentPage: current } = response.data;

        // Transform items to match CommissionTransaction type (convert numbers to strings)
        const transformedItems: CommissionTransaction[] = items.map(item => ({
          ...item,
          originalAmount: item.originalAmount.toString(),
          receivedAmount: item.receivedAmount.toString(),
          commissionAmount: item.commissionAmount.toString(),
        }));

        setTotalPages(total);
        setCurrentPage(current);

        if (isLoadMore) {
          setData(prev => [...prev, ...transformedItems]);
        } else {
          setData(transformedItems);
        }
      } else {
        throw new Error(response.message || 'Failed to fetch commissions');
      }
    } catch (err) {
      setError(err);
      console.error('Error fetching commissions:', err);
    } finally {
      setLoadingInitial(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [pageSize]);

  // Initial load
  useEffect(() => {
    fetchCommissions(1, isPaidFilter);
  }, [fetchCommissions, isPaidFilter]);

  // Debounced filter change
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (isPaid !== isPaidFilter) {
        setIsPaidFilter(isPaid);
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [isPaid, isPaidFilter, debounceMs]);

  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore && !loadingInitial) {
      fetchCommissions(currentPage + 1, isPaidFilter, true);
    }
  }, [hasMore, loadingMore, loadingInitial, currentPage, isPaidFilter, fetchCommissions]);

  const refresh = useCallback(() => {
    setCurrentPage(1);
    fetchCommissions(1, isPaidFilter, false, true);
  }, [isPaidFilter, fetchCommissions]);

  const setPaidFilter = useCallback((paid?: boolean) => {
    setIsPaidFilter(paid);
    setCurrentPage(1);
  }, []);

  return {
    data,
    loadingInitial,
    loadingMore,
    refreshing,
    error,
    hasMore,
    loadMore,
    refresh,
    setPaidFilter,
    isPaidFilter,
  };
}