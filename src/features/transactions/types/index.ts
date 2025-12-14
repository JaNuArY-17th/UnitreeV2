// Legacy transaction types (keep for backward compatibility)
export interface TransactionDetail {
  id: string;
  amount: string;
  amountInWords: string;
  paidBy: string;
  billedAmount: string;
  discountOffered: string;
  amountReceived: string;
  paidAt: string;
  status: 'paid' | 'pending' | 'failed';
  isVerified?: boolean;
}

export interface TransactionBreakdownItem {
  label: string;
  value: string;
}

export interface TransactionScreenParams {
  transaction: TransactionDetail;
}

// Export new bank transaction types
export * from './transaction';