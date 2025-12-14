/**
 * Product Variation API Types
 * Based on ESPay API OpenAPI Specification v1.0
 * @see API_DOCUMENTATION.md
 */

import type { ApiResponse } from './common';

// ============================================================================
// Variation Models
// ============================================================================

export interface Variation {
  id: string;
  product_id: string;
  sku: string;
  name: string;
  unit?: string;
  status: VariationStatus;
  quantity: number;
  price?: number;
  sale_price?: number;
  import_price?: number;
  tax_rate?: number;
  max_price?: number;
  min_price?: number;
  fileIds?: string[];
  fileUrls?: string[];
}

export type VariationStatus = 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISCONTINUED';

// Global search statuses (for cart/POS use cases)
export type GlobalVariationStatus = 'AVAILABLE' | 'SOLD' | 'SOLDOUT' | 'DAMAGED' | 'RESERVED';

// ============================================================================
// Request Types
// ============================================================================

/**
 * Global variation search parameters
 * Used for searching variations across all products
 */
export interface GlobalVariationSearchParams {
  name?: string; // Search by variation name
  status?: GlobalVariationStatus; // Filter by status
}

export interface VariationCreateRequest {
  sku: string; // Required
  name: string; // Required
  unit?: string;
  status?: VariationStatus;
  quantity?: number;
  price?: number;
  salePrice?: number;
  importPrice?: number;
  taxRate?: number;
  maxPrice?: number;
  minPrice?: number;
  fileIds?: string[];
}

export interface VariationUpdateRequest {
  sku?: string;
  name?: string;
  unit?: string;
  status?: VariationStatus;
  quantity?: number;
  price?: number;
  salePrice?: number;
  importPrice?: number;
  taxRate?: number;
  maxPrice?: number;
  minPrice?: number;
  fileIds?: string[];
}

// ============================================================================
// Response Types
// ============================================================================

export interface VariationResponse {
  id: string;
  product_id: string;
  productId?: string;
  sku: string;
  name: string;
  unit?: string;
  status: VariationStatus;
  quantity: number;
  price?: number;
  sale_price?: number;
  salePrice?: number;
  import_price?: number;
  importPrice?: number;
  tax_rate?: number;
  taxRate?: number;
  max_price?: number;
  maxPrice?: number;
  min_price?: number;
  minPrice?: number;
  file_ids?: string[];
  fileIds?: string[];
  file_urls?: string[];
  fileUrls?: string[];
}

// ============================================================================
// API Response Wrappers
// ============================================================================

export type VariationApiResponse = ApiResponse<VariationResponse>;
export type VariationListApiResponse = ApiResponse<VariationResponse[]>;

// ============================================================================
// Form Types (for UI)
// ============================================================================

export interface VariationFormData {
  sku: string;
  name: string;
  unit?: string;
  status?: VariationStatus;
  quantity?: number;
  price?: number;
  salePrice?: number;
  importPrice?: number;
  taxRate?: number;
  maxPrice?: number;
  minPrice?: number;
  fileIds?: string[];
}

export interface VariationFormErrors {
  sku?: string;
  name?: string;
  unit?: string;
  status?: string;
  quantity?: string;
  price?: string;
  salePrice?: string;
  importPrice?: string;
  taxRate?: string;
  general?: string;
}

