export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  description: string;
  date: Date;
  category?: string;
  avatar?: string;
  status?: 'completed' | 'pending' | 'failed';
}

export interface StatisticsData {
  income: number;
  spending: number;
  period: 'week' | 'month' | 'year';
  chartData: ChartDataPoint[];
  highest: {
    income: number;
    date: string;
  };
}

export interface ChartDataPoint {
  day: string;
  value: number;
  label: string;
}

export interface BalanceInfo {
  total: number;
  currency: string;
  change: number;
  changePercentage: number;
  period: string;
}

export interface ReportScreenProps {
  // Navigation props if needed
}

export interface StatisticsCardProps {
  data: StatisticsData;
  onPeriodChange?: (period: 'week' | 'month' | 'year') => void;
}

export interface TransactionListProps {
  transactions: Transaction[];
  onSortChange?: (sortBy: string) => void;
  onTransactionPress?: (transaction: Transaction) => void;
}

export interface BalanceCardProps {
  balance: BalanceInfo;
  userName: string;
}

export type TimeframePeriod = 'week' | 'month' | 'year';

export interface ReportFilters {
  period: TimeframePeriod;
  category?: string;
  sortBy: 'date' | 'amount' | 'type';
  sortOrder: 'asc' | 'desc';
}