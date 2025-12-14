export type monthType = "Jan" | "Feb" | "Mar" | "Apr" | "May" | "Jun" | "Jul" | "Aug" | "Sep" | "Oct" | "Nov" | "Dec";

export type statusType = "PENDING" | "APPROVED" | "LOCKED";

export interface IncomeExpenseChartItem {
  month: monthType,
  monthLabel: string,
  IncomeAmount: string
  ExpenseAmount: string
}

export interface IncomeTransactionChartItem {
  month: monthType,
  monthLabel: string,
  incomeAmount: number,
  transactionCount: number
}

export interface DashboardParams {
  // date format: dd/MM/yyyy
  fromDate: string,
  toDate: string
}

export interface DashboardResponse {
  success: boolean,
  message: string,
  data: {
    successfulTransactions: {
      count: number
    },
    failedTransactions: {
      count: number
    },
    income: {
      originalAmount: string,
      receivedAmount: string,
      currency: string
      commissionPercent: number
    },
    expense: {
      amount: string,
      currency: string
    },
    incomeExpenseChart: IncomeExpenseChartItem[],
    incomeTransactionChart: IncomeTransactionChartItem[],
  },
  code: number
}

