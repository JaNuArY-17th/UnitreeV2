import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { invoiceService } from '../services/invoiceService';
import type { TaxCodeResponse } from '../types/invoice';

// Query keys for invoice feature
export const INVOICE_QUERY_KEYS = {
  all: ['invoice'] as const,
  taxCode: (taxCode: string) => [...INVOICE_QUERY_KEYS.all, 'taxCode', taxCode] as const,
};

/**
 * Hook to get tax code information
 * @param taxCode - Tax code to lookup (10 or 13 digit number)
 * @param options - React Query options
 */
export const useGetTaxCode = (
  taxCode: string,
  options?: Omit<UseQueryOptions<TaxCodeResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<TaxCodeResponse, Error>({
    queryKey: INVOICE_QUERY_KEYS.taxCode(taxCode),
    queryFn: () => invoiceService.getTaxCodeInfo(taxCode),
    enabled: !!taxCode && taxCode.length >= 10, // Only run if tax code is valid length
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    ...options,
  });
};

/**
 * Main invoice hook combining all invoice-related queries
 */
export const useInvoice = () => {
  return {
    useGetTaxCode,
  };
};
