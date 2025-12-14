/**
 * Invoice feature type definitions
 */

// Tax Code Information Response
export interface TaxCodeInfo {
  ma_so_thue: string;
  masothue_id: string;
  ten_cty: string | null;
  dia_chi: string | null;
  cqthuecap_tinh: string | null;
  cqthue_ql: string | null;
  nguoi_dai_dien: string | null;
  ngay_thanh_lap: string | null;
  tthai: string | null;
  ten_tthai: string | null;
}

// API Response wrapper
export interface InvoiceApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  code: number;
}

// Tax Code Lookup Response
export type TaxCodeResponse = InvoiceApiResponse<TaxCodeInfo>;

// Export all types
export type {
  InvoiceApiResponse as ApiResponse,
};
