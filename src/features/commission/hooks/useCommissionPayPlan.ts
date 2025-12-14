import { useCallback, useEffect, useState } from 'react';
import { commissionService } from '../services/commissionService';
import type { CommissionTransaction } from '../types';

interface UseCommissionPayPlanResult {
  data: {
    currentBalance: string;
    totalPayment: number;
    payable: CommissionTransaction[];
  } | null;
  loading: boolean;
  error?: any;
  refetch: () => void;
}

export function useCommissionPayPlan(): UseCommissionPayPlanResult {
  const [data, setData] = useState<{
    currentBalance: string;
    totalPayment: number;
    payable: CommissionTransaction[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>();

  const fetchPayPlan = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);
      const response = await commissionService.getCommissionPayPlan();
      if (response.success) {
        setData(response.data);
      } else {
        setError(new Error(response.message || 'Failed to fetch commission pay plan'));
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayPlan();
  }, [fetchPayPlan]);

  return {
    data,
    loading,
    error,
    refetch: fetchPayPlan,
  };
}