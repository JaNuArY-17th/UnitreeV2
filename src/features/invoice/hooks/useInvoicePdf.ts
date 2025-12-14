/**
 * useInvoicePdf Hook
 * React Query hook for fetching invoice PDFs
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import { invoiceService } from '../services/invoiceService';
import { invoiceCacheManager } from '../utils/invoiceCache';

// Query keys for React Query caching
export const INVOICE_QUERY_KEYS = {
  all: ['invoice'] as const,
  pdf: (orderId: string) => [...INVOICE_QUERY_KEYS.all, 'pdf', orderId] as const,
  pdfBase64: (orderId: string) => [...INVOICE_QUERY_KEYS.all, 'pdfBase64', orderId] as const,
  download: (orderId: string) => [...INVOICE_QUERY_KEYS.all, 'download', orderId] as const,
  view: (orderId: string) => [...INVOICE_QUERY_KEYS.all, 'view', orderId] as const,
};

/**
 * Hook to download invoice PDF and save to device storage
 * Shows success/error notifications
 * @param options - React Query options
 */
export const useDownloadInvoicePdf = (
  options?: {
    onSuccess?: (filePath: string) => void;
    onError?: (error: any) => void;
  }
) => {
  return useMutation({
    mutationFn: async (orderId: string) => {
      if (!orderId) {
        throw new Error('Order ID is required');
      }
      return await invoiceService.downloadInvoicePdf(orderId);
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

/**
 * Hook to download and view invoice PDF in modal
 * Automatically opens the viewer when download is complete
 * @param options - React Query options
 */
export const useViewInvoicePdf = (
  options?: {
    onSuccess?: (filePath: string) => void;
    onError?: (error: any) => void;
  }
) => {
  return useMutation({
    mutationFn: async (orderId: string) => {
      if (!orderId) {
        throw new Error('Order ID is required');
      }
      return await invoiceService.downloadInvoicePdf(orderId);
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

/**
 * Hook to get invoice PDF as base64
 * @param orderId - Order ID
 * @param options - React Query options
 */
export const useInvoicePdfBase64 = (
  orderId: string | undefined,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    onSuccess?: (base64: string) => void;
    onError?: (error: any) => void;
  }
) => {
  return useQuery({
    queryKey: INVOICE_QUERY_KEYS.pdfBase64(orderId || ''),
    queryFn: async () => {
      if (!orderId) {
        throw new Error('Order ID is required');
      }
      return await invoiceService.getInvoicePdfBase64(orderId);
    },
    enabled: !!orderId && (options?.enabled ?? true),
    staleTime: options?.staleTime ?? 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 404 or 403
      if (error?.response?.status === 404 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

/**
 * Hook to share invoice PDF
 */
export const useShareInvoicePdf = (
  options?: {
    onSuccess?: (filePath: string) => void;
    onError?: (error: any) => void;
  }
) => {
  return useMutation({
    mutationFn: async (orderId: string) => {
      if (!orderId) {
        throw new Error('Order ID is required');
      }
      return await invoiceService.shareInvoicePdf(orderId);
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

/**
 * Hook to check if invoice is cached
 * @param orderId - Order ID
 */
export const useInvoiceCache = (orderId: string | undefined) => {
  return useQuery({
    queryKey: ['invoiceCache', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      return await invoiceCacheManager.getCachedFile(orderId);
    },
    enabled: !!orderId,
    staleTime: Infinity, // Cache status never goes stale
  });
};

/**
 * Hook to save invoice PDF to gallery/library using Share API
 */
export const useSaveInvoicePdfToGallery = (
  options?: {
    onSuccess?: (result: any) => void;
    onError?: (error: any) => void;
  }
) => {
  return useMutation({
    mutationFn: async (orderId: string) => {
      if (!orderId) {
        throw new Error('Order ID is required');
      }
      return await invoiceService.saveInvoicePdfToGallery(orderId);
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

/**
 * Hook to download order item images
 */
export const useDownloadOrderImages = (
  options?: {
    onSuccess?: (filePaths: string[]) => void;
    onError?: (error: any) => void;
  }
) => {
  return useMutation({
    mutationFn: async ({ orderId, imageUrls }: { orderId: string; imageUrls: string[] }) => {
      if (!orderId) {
        throw new Error('Order ID is required');
      }
      if (!imageUrls || imageUrls.length === 0) {
        throw new Error('No image URLs provided');
      }
      return await invoiceService.downloadOrderImages(orderId, imageUrls);
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
