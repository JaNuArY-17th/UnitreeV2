import { useQuery } from '@tanstack/react-query';
import { ReportService } from '../services/ReportService';
import type { DashboardParams, DashboardResponse } from '../types/report';

export const useDashboardReport = (params: DashboardParams, enabled = true) => {
  return useQuery<DashboardResponse, Error>({
    queryKey: ['dashboard-report', params.fromDate, params.toDate],
    queryFn: () => ReportService.getDashboardReport(params),
    enabled: enabled && !!params.fromDate && !!params.toDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};