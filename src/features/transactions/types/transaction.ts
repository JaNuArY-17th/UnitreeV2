/**
 * Transaction related types
 */

// Import and re-export BankType from deposit feature for transaction queries
import type { BankType } from '@/features/deposit/types/bank';
export type { BankType };

export type TransactionType = 'ALL' | 'MONEY_IN' | 'MONEY_OUT' | 'CREDIT';

export interface TransactionHistoryParams {
  page: number;
  limit: number;
  bankType: BankType;
  type: TransactionType;
  transactionType?: string; // Additional transaction type filter like 'CREDIT'
  fromDate?: string;
  toDate?: string;
}

export interface Transaction {
  id: number;
  transactionCode: string;
  amount: string;
  state: TransactionType;
  description: string;
  createdAt: string;
  orderId?: string; // Optional order ID from transaction
  transactionType: string; // Source of funds: REAL or CREDIT
}

export interface TransactionHistoryResponse {
  success: boolean;
  message: string;
  data: {
    transactions: Transaction[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  };
  code: number;
}

export interface TransactionDetailResponse {
  success: boolean;
  message: string;
  data: Transaction;
  code: number;
}

// UI types for transaction display
export interface UiHistoryTransaction {
  id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  status: 'processing' | 'success' | 'failed';
  createdAt: string;
  transactionId: string;
  description: string; // Added to match API response
  transactionCode: string; // Added to match API response
  bankName: string;
  bankNumberMasked: string;
  holderName: string;
  state: TransactionType; // Added for description logic
  toBankName?: string; // Added for description logic
  fromAccountName?: string; // Added for description logic
  toAccountName?: string; // Added for description logic
  fromBankName?: string; // Added for potential future use
}

// Filter types
export type HistoryTypeFilter = 'all' | 'deposit' | 'withdraw';
export type HistoryDateFilter = 'all' | 'today' | '7d' | '30d';
export type TransactionTypeFilter = 'all' | 'deposit' | 'withdraw' | 'credit';
export type TransactionDateFilter = 'all' | 'today' | '7d' | '30d';