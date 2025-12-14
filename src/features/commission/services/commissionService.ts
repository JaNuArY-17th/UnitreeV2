import { apiClient } from '@/shared/utils/axios';
import { API_ENDPOINTS } from '@/shared/config';
import type { CommissionPayInitiateResponse, CommissionPayVerifyResponse, CommissionPayResendRequest, CommissionPayVerifyRequest, GetCommissionTransactionParams, GetCommissionTransactionsResponse, CommissionPayPlanResponse, StoreDashboardResponse } from '../types';

export const commissionService = {
    // Initiate commission payment
    initiateCommissionPayment: async (): Promise<CommissionPayInitiateResponse> => {
        const response = await apiClient.post(API_ENDPOINTS.STORE.COMMISSIONS_PAY_INITIATE);
        return response.data as CommissionPayInitiateResponse;
    },

    // Resend OTP for commission payment
    resendCommissionPaymentOtp: async (request: CommissionPayResendRequest): Promise<CommissionPayInitiateResponse> => {
        const response = await apiClient.post(API_ENDPOINTS.STORE.COMMISSIONS_PAY_RESEND, request);
        return response.data as CommissionPayInitiateResponse;
    },

    // Verify OTP for commission payment
    verifyCommissionPaymentOtp: async (request: CommissionPayVerifyRequest): Promise<CommissionPayVerifyResponse> => {
        const response = await apiClient.post(API_ENDPOINTS.STORE.COMMISSIONS_PAY_VERIFY, request);
        return response.data as CommissionPayVerifyResponse;
    },

    // Get commission transactions with pagination and optional filter
    getCommissionTransactions: async (params: GetCommissionTransactionParams): Promise<GetCommissionTransactionsResponse> => {
        const response = await apiClient.get(API_ENDPOINTS.STORE.GET_COMMISSION_TRANSACTIONS, { params });
        return response.data as GetCommissionTransactionsResponse;
    },

    // Get commission payment plan
    getCommissionPayPlan: async (): Promise<CommissionPayPlanResponse> => {
        const response = await apiClient.get(API_ENDPOINTS.STORE.COMMISSION_PAY_PLAN);
        return response.data as CommissionPayPlanResponse;
    },

    // Get store dashboard data
    getStoreDashboard: async (): Promise<StoreDashboardResponse> => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const fromDate = `${startOfMonth.getDate().toString().padStart(2, '0')}/${(startOfMonth.getMonth() + 1).toString().padStart(2, '0')}/${startOfMonth.getFullYear()}`;
        const toDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

        const url = `${API_ENDPOINTS.STORE.DASHBOARD}?fromDate=${fromDate}&toDate=${toDate}`;
        const response = await apiClient.get(url);
        return response.data as StoreDashboardResponse;
    },
}