import { useMutation } from '@tanstack/react-query';
import { QRService } from '../services/QRServive';
import type { QRInformationRequest, QRInformationResponse } from '../types/transfer';

/**
 * Hook to get QR information from scanned QR content
 * Usage: const { mutate, data, isLoading, error } = useQRInformation();
 * mutate({ qrContent: ... })
 */
export function useQRInformation() {
  return useMutation<QRInformationResponse, Error, QRInformationRequest>({
    mutationFn: QRService.getQRInformation,
  });
}
