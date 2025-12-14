import { useCallback, useEffect, useState } from 'react';
import { commissionService } from '../services/commissionService';
import type { StoreDashboardResponse } from '../types';

interface UseStoreDashboardResult {
  data: StoreDashboardResponse['data'] | null;
  loading: boolean;
  error?: any;
  refetch: () => void;
}

export function useStoreDashboard(): UseStoreDashboardResult {
  const [data, setData] = useState<StoreDashboardResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>();

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);
      const response = await commissionService.getStoreDashboard();
      if (response.success) {
        setData(response.data);
      } else {
        setError(new Error(response.message || 'Failed to fetch store dashboard'));
      }
    } catch (err) {
      console.error('Dashboard API error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboard,
  };
}