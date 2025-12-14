import { apiClient } from '@/shared/utils/axios';
import { API_ENDPOINTS } from '@/shared/config/env';
import type { DashboardParams, DashboardResponse, monthType, statusType, IncomeExpenseChartItem, IncomeTransactionChartItem } from '../types/report';

export const ReportService = {
  // Get dashboard report
  async getDashboardReport(params: DashboardParams): Promise<DashboardResponse> {
    const url = `${API_ENDPOINTS.STORE.DASHBOARD}?fromDate=${params.fromDate}&toDate=${params.toDate}`;
    const response = await apiClient.get<DashboardResponse>(url);
    return response.data as DashboardResponse;
  }
}