/**
 * Invoice Service
 * Handles voice-to-invoice parsing API calls
 */

import { apiClient } from '@/shared/utils/axios';
import type {
  InvoiceParseRequest,
  InvoiceParseResponse,
} from '../types/invoice';

// API base path - Invoice endpoint
const BASE_PATH = '/v1/invoice';

/**
 * Invoice Service
 */
export const invoiceService = {
  /**
   * Parse voice text into invoice items
   * @param text - Voice transcription text
   * @example
   * parseInvoice({
   *   text: "hai chai Coca giá 15.000"
   * })
   * Returns: {
   *   itemsVoice: [{
   *     itemName: 'Coca',
   *     unit: 'chai',
   *     quantity: 2,
   *     unitPrice: 7500,
   *     totalLineAmount: 15000,
   *     discountAmount: 0,
   *     finalLineAmount: 15000
   *   }]
   * }
   */
  parseInvoice: async (
    data: InvoiceParseRequest
  ): Promise<InvoiceParseResponse> => {
    const response = await apiClient.post<InvoiceParseResponse>(
      BASE_PATH,
      data
    );
    return response.data || { itemsVoice: [] };
  },
};
