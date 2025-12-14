import { apiClient } from '@/shared/utils/axios';
import { API_ENDPOINTS } from '@/shared/config/env';
import { bankTypeManager } from '@/features/deposit/utils/bankTypeManager';
import type { 
  TransactionHistoryParams, 
  TransactionHistoryResponse, 
  TransactionDetailResponse,
  BankType 
} from '../types';

/**
 * Transaction service for API calls
 */
export const transactionService = {
  /**
   * Get bank transactions
   */
  getTransactions: async (params: Partial<TransactionHistoryParams>): Promise<TransactionHistoryResponse> => {
    // Use current bank type if not provided, and always await for async fallback
    let bankType = params.bankType;
    if (!bankType) {
      bankType = await bankTypeManager.getBankType();
    }
    if (!bankType) {
      bankType = 'USER'; // fallback
    }
    const { page = 1, limit = 10, type = 'ALL', transactionType, fromDate, toDate } = params;
    // Manually build query string as requested (instead of relying on axios params option)
    // Format date params as DD/MM/YYYY if provided (API expects this format, e.g. 25/08/2025)
    const formatDate = (val: string) => {
      // If already in dd/MM/yyyy (contains '/' and no 'T'), return as-is
      if (val && val.includes('/') && !val.includes('T')) return val;
      const d = new Date(val);
      if (isNaN(d.getTime())) return val; // fallback pass-through
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    };
    const queryEntries: [string, string][] = [
      ['page', String(page)],
      ['limit', String(limit)],
      ['bankType', bankType],
      ['type', type]
    ];
    if (transactionType) queryEntries.push(['transactionType', transactionType]);
    if (fromDate) queryEntries.push(['fromDate', formatDate(fromDate)]);
    if (toDate) queryEntries.push(['toDate', formatDate(toDate)]);
    const query = queryEntries
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    const url = `${API_ENDPOINTS.BANK.TRANSACTIONS}?${query}`;

    // Dedupe identical requests within a short window to avoid spam on rapid re-renders
    const cacheKey = url;
    const now = Date.now();
    const windowMs = 400; // collapse calls within 400ms
    const svcAny = transactionService as any;
    if (!svcAny._txnReqCache) {
      svcAny._txnReqCache = new Map<string, { ts: number; promise: Promise<TransactionHistoryResponse> }>();
    }
    const cache: Map<string, { ts: number; promise: Promise<TransactionHistoryResponse> }> = svcAny._txnReqCache;
    const existing = cache.get(cacheKey);
    if (existing && (now - existing.ts) < windowMs) {
      return existing.promise;
    }
    const exec = (async () => {
      const response = await apiClient.get<TransactionHistoryResponse>(url);
      return response.data as TransactionHistoryResponse;
    })();
    cache.set(cacheKey, { ts: now, promise: exec });
    // Lazy cleanup
    setTimeout(() => {
      const item = cache.get(cacheKey);
      if (item && Date.now() - item.ts >= windowMs) cache.delete(cacheKey);
    }, windowMs * 3);
    return exec;
  },

  /**
   * Get transaction detail
   */
  getTransactionDetails: async (id: string, bankType?: BankType): Promise<TransactionDetailResponse> => {
    const effectiveBankType = bankType || bankTypeManager.getBankType();
    const url = `${API_ENDPOINTS.BANK.TRANSACTIONS_DETAIL}/${id}/my?bankType=${effectiveBankType}`;
    const response = await apiClient.get<TransactionDetailResponse>(url);

    return response.data as TransactionDetailResponse;
  }
};