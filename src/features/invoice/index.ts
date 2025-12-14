/**
 * Invoice feature public API
 * Export all public interfaces, types, hooks, and services
 */

// Services
export { invoiceService, InvoiceService } from './services/invoiceService';

// Hooks
export { useInvoice, useGetTaxCode, INVOICE_QUERY_KEYS } from './hooks/useInvoice';
export {
  useDownloadInvoicePdf,
  useViewInvoicePdf,
  useInvoicePdfBase64,
  useShareInvoicePdf,
  useSaveInvoicePdfToGallery,
  useDownloadOrderImages,
  useInvoiceCache,
  useClearInvoiceCache,
  INVOICE_QUERY_KEYS as INVOICE_PDF_QUERY_KEYS,
} from './hooks/useInvoicePdf';

// Components
export { default as PdfViewerModal } from './components/PdfViewerModal';

// Utils
export { invoiceCacheManager, InvoiceCacheManager } from './utils/invoiceCache';

// Types
export type {
  TaxCodeInfo,
  TaxCodeResponse,
  InvoiceApiResponse,
} from './types/invoice';
