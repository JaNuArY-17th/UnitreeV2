import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { transactionService } from '../services/transactionService';
import { bankTypeManager } from '@/features/deposit/utils/bankTypeManager';
import type { 
  TransactionHistoryParams, 
  Transaction, 
  BankType, 
  UiHistoryTransaction,
  HistoryTypeFilter,
  HistoryDateFilter
} from '../types';

interface UseTransactionHistoryOptions {
  bankType?: BankType;
  typeFilter: HistoryTypeFilter;
  dateFilter: HistoryDateFilter;
  pageSize?: number;
  debounceMs?: number;
}

interface UseTransactionHistoryResult {
  data: UiHistoryTransaction[];
  loadingInitial: boolean;
  loadingMore: boolean;
  refreshing: boolean;
  error?: any;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
  setFilters: (t: HistoryTypeFilter, d: HistoryDateFilter) => void;
  typeFilter: HistoryTypeFilter;
  dateFilter: HistoryDateFilter;
}

// Map API state -> UI type
const mapTxnType = (state: string): 'deposit' | 'withdraw' => state === 'MONEY_IN' ? 'deposit' : 'withdraw';

export function useTransactionHistory(opts: UseTransactionHistoryOptions): UseTransactionHistoryResult {
  const {
    bankType,
    typeFilter: externalType,
    dateFilter: externalDate,
    pageSize = 20,
    debounceMs = 300
  } = opts;

  // Use provided bankType or get from manager (async fallback)
  const [effectiveBankType, setEffectiveBankType] = useState<BankType | undefined>(bankType);
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!bankType) {
        const loaded = await bankTypeManager.getBankType();
        if (mounted) setEffectiveBankType(loaded || 'USER');
      } else {
        setEffectiveBankType(bankType);
      }
    })();
    return () => { mounted = false; };
  }, [bankType]);

  const [typeFilter, setTypeFilter] = useState<HistoryTypeFilter>(externalType);
  const [dateFilter, setDateFilter] = useState<HistoryDateFilter>(externalDate);
  const [debouncedType, setDebouncedType] = useState(externalType);
  const [debouncedDate, setDebouncedDate] = useState(externalDate);

  const [data, setData] = useState<UiHistoryTransaction[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<any>();

  // Track current in-flight request id to drop stale responses
  const requestIdRef = useRef(0);

  // Sync external filter changes
  useEffect(() => { setTypeFilter(externalType); }, [externalType]);
  useEffect(() => { setDateFilter(externalDate); }, [externalDate]);

  // Debounce logic
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedType(typeFilter);
      setDebouncedDate(dateFilter);
    }, debounceMs);
    return () => clearTimeout(handle);
  }, [typeFilter, dateFilter, debounceMs]);

  const apiType = useMemo<'ALL' | 'MONEY_IN' | 'MONEY_OUT'>(() => {
    switch (debouncedType) {
      case 'deposit': return 'MONEY_IN';
      case 'withdraw': return 'MONEY_OUT';
      default: return 'ALL';
    }
  }, [debouncedType]);

  const dateRange = useMemo(() => {
    if (debouncedDate === 'all') return { fromDate: undefined, toDate: undefined };
    const now = new Date();
    let start: Date;
    if (debouncedDate === 'today') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (debouncedDate === '7d') {
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else { // 30d
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    return { fromDate: start.toISOString(), toDate: now.toISOString() };
  }, [debouncedDate]);


  // Ensure bankType is never undefined (fallback to 'USER' if needed)
  const buildParams = useCallback((pageParam: number): TransactionHistoryParams => ({
    page: pageParam,
    limit: pageSize,
    bankType: effectiveBankType,
    type: apiType,
    fromDate: dateRange.fromDate,
    toDate: dateRange.toDate
  }), [pageSize, effectiveBankType, apiType, dateRange]);

  const mapTransactions = (transactions: Transaction[]): UiHistoryTransaction[] => transactions.map(tx => ({
    id: String(tx.id),
    type: mapTxnType(tx.state),
    amount: Number(tx.amount),
    status: 'success', // Placeholder until API provides status
    createdAt: tx.createdAt,
    transactionId: tx.transactionCode,
    transactionCode: tx.transactionCode, // Ensure transactionCode is present
    description: tx.description, // Pass through description from API
    bankName: '',
    bankNumberMasked: '',
    holderName: '',
    state: tx.state,
    toBankName: (tx as any).toBankName || '',
    fromAccountName: (tx as any).fromAccountName || '',
    toAccountName: (tx as any).toAccountName || '',
    fromBankName: (tx as any).fromBankName || '',
  }));

  const fetchPage = useCallback(async (pageParam: number, mode: 'append' | 'replace') => {
    const reqId = ++requestIdRef.current;
    mode === 'replace' ? setLoadingInitial(true) : setLoadingMore(true);
    setError(undefined);
    try {
      const res = await transactionService.getTransactions(buildParams(pageParam));
      if (requestIdRef.current !== reqId) return; // stale
      const mapped = mapTransactions(res.data.transactions || []);
      setHasMore(pageParam < res.data.totalPages);
      setPage(res.data.currentPage);
      setData(prev => mode === 'replace' ? mapped : [...prev, ...mapped]);
    } catch (e) {
      if (requestIdRef.current !== reqId) return;
      setError(e);
    } finally {
      if (requestIdRef.current === reqId) {
        setLoadingInitial(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    }
  }, [buildParams]);

  // Refetch when debounced filters change
  useEffect(() => {
    setData([]);
    setHasMore(true);
    setPage(1);
    fetchPage(1, 'replace');
  }, [debouncedType, debouncedDate, fetchPage]);

  const loadMore = useCallback(() => {
    if (loadingMore || loadingInitial || !hasMore) return;
    fetchPage(page + 1, 'append');
  }, [loadingMore, loadingInitial, hasMore, page, fetchPage]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    setHasMore(true);
    fetchPage(1, 'replace');
  }, [fetchPage]);

  const setFilters = useCallback((t: HistoryTypeFilter, d: HistoryDateFilter) => {
    setTypeFilter(t);
    setDateFilter(d);
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
    setFilters,
    typeFilter,
    dateFilter,
  };
}

// Legacy export for backward compatibility
export const useBankTransactionHistory = useTransactionHistory;
export type { UseTransactionHistoryOptions, UseTransactionHistoryResult };
export type UseBankTransactionHistoryOptions = UseTransactionHistoryOptions;
export type UseBankTransactionHistoryResult = UseTransactionHistoryResult;