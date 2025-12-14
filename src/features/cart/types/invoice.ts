/**
 * Invoice Types
 * Types for voice-to-invoice parsing API
 */

/**
 * Parsed invoice item from voice text
 * Based on actual API response:
 * {
 *   itemName: 'Coca',
 *   unit: 'chai',
 *   quantity: 2,
 *   unitPrice: 7500,
 *   totalLineAmount: 15000,
 *   discountAmount: 0,
 *   finalLineAmount: 15000
 * }
 */
export interface InvoiceItem {
  itemName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalLineAmount: number;
  discountAmount: number;
  finalLineAmount: number;
}

/**
 * Invoice parse response wrapper
 */
export interface InvoiceParseResponse {
  itemsVoice: InvoiceItem[];
}

/**
 * Request body for invoice parse
 */
export interface InvoiceParseRequest {
  text: string;
}
