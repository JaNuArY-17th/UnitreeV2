import { Transaction, StatisticsData, BalanceInfo, ChartDataPoint } from '../types';

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    amount: 1200,
    currency: 'USD',
    description: 'Joao Cooper',
    date: new Date('2024-09-12'),
    category: 'receive',
    avatar: '👤',
    status: 'completed'
  },
  {
    id: '2',
    type: 'expense',
    amount: 850,
    currency: 'USD',
    description: 'Monthly Subscription',
    date: new Date('2024-09-11'),
    category: 'subscription',
    status: 'completed'
  },
  {
    id: '3',
    type: 'income',
    amount: 2500,
    currency: 'USD',
    description: 'Freelance Payment',
    date: new Date('2024-09-10'),
    category: 'work',
    status: 'completed'
  },
  {
    id: '4',
    type: 'expense',
    amount: 430,
    currency: 'USD',
    description: 'Friend & Family',
    date: new Date('2024-09-09'),
    category: 'personal',
    status: 'completed'
  }
];

export const mockChartData: ChartDataPoint[] = [
  { day: 'S', value: 8000, label: 'Sun' },
  { day: 'M', value: 12000, label: 'Mon' },
  { day: 'T', value: 9500, label: 'Tue' },
  { day: 'W', value: 11000, label: 'Wed' },
  { day: 'T', value: 13123, label: 'Thu' },
  { day: 'F', value: 8500, label: 'Fri' },
  { day: 'S', value: 10000, label: 'Sat' }
];

export const mockStatisticsData: StatisticsData = {
  income: 13123,
  spending: 8500,
  period: 'week',
  chartData: mockChartData,
  highest: {
    income: 13123,
    date: '03 July 2024'
  }
};

export const mockBalanceInfo: BalanceInfo = {
  total: 82758.10,
  currency: 'USD',
  change: 2500,
  changePercentage: 3.12,
  period: 'this month'
};

export const mockUser = {
  name: 'Ali Husni',
  greeting: '👋'
};