export type PostpaidStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'LOCKED';

export type PaymentStatus = 'PAID' | 'UNPAID' | 'PARTIAL_PAID' | 'OVERDUE';

export interface PostpaidCycle {
    cycleId: string;
    startDate: string;
    endDate: string;
    dueDate: string;
    amountDue: number;
    paymentStatus: PaymentStatus;
    gracePeriodEndDate: string;
    createdAt: string;
    updatedAt: string;
}

export interface MyPostPaidResponse {
    success: boolean;
    message: string;
    data: {
        userId: string;
        bankId: string;
        currentCycleId: string;
        creditLimit: number;
        spentCredit: number;
        status: PostpaidStatus;
        dueDate: string;
        gracePeriodEndDate: string;
        amountDueTotal: number;
        amountPaidTotal: number;
        commissionPercent: number;
        createdAt: string;
        updatedAt: string;
        cycles: PostpaidCycle[];
    };
    code: number;
}

export interface RequestPostPaidResponse {
    success: boolean;
    message: string;
    data: {
        status: PostpaidStatus;
    };
    code: number;
}

export interface RequestPostpaidPayResponse {
    success: boolean,
    message: string,
    data: {
        requestId: string,
        phone: string,
        expireInSeconds: number
    },
    code: number
}

export interface RequestPostpaidPayResend {
    tempRequestId: string
}

export interface RequestPostpaidPayVerify {
    tempRequestId: string,
    otp: string
}

export interface RequestPostpaidPayVerifyResponse {
    success: boolean,
    message: string,
    data: {
        paidAmount: number,
        status: PostpaidStatus,
        spentCredit: number
    },
    code: number
}

export interface PostpaidResponse {
    success: boolean,
    message: string,
    data: {},
    code: number
}