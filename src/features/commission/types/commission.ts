export interface CommissionPayInitiateResponse {
    success: boolean;
    message: string;
    data: {
        requestId: string;
    }
    code: number;
}

export interface CommissionPayVerifyResponse {
    success: boolean;
    message: string;
    data: {
        paidAmount: number;
        paidCount: number;
    }
    code: number;
}

export interface CommissionPayResendRequest {
    requestId: string;
}

export interface CommissionPayVerifyRequest {
    tempRequestId: string;
    otp: string;
}

export interface GetCommissionTransactionParams {
    page: number;
    size: number;
    isPaid?: boolean; // empty for all, true for paid, false for unpaid
}

export interface CommissionTransaction {
    id: string;
    transactionCode: string;
    commissionPercentage: number;
    originalAmount: string;
    receivedAmount: string;
    commissionAmount: string;
    isPaid: boolean;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
}

export interface GetCommissionTransactionsResponse {
    success: boolean;
    message: string;
    data: {
        currentPage: number;
        totalItems: number;
        totalPages: number;
        items: CommissionTransaction[];
    }
    code: number;
}

export interface CommissionPayPlanResponse {
    success: boolean;
    message: string;
    data: {
        currentBalance: string;
        totalPayment: number;
        payable: CommissionTransaction[];
    }
    code: number;
}

export interface StoreDashboardResponse {
    success: boolean;
    message: string;
    data: {
        successfulTransactions: {
            count: number;
        };
        failedTransactions: {
            count: number;
        };
        income: {
            originalAmount: string;
            receivedAmount: string;
            currency: string;
            commissionPercent: string;
        };
        expense: {
            amount: string;
            currency: string;
        };
        incomeExpenseChart: any[]; // We'll define this properly if needed
        incomeTransactionChart: any[]; // We'll define this properly if needed
    };
    code: number;
}
