/**
 * Product API Types
 * Based on ESPay API OpenAPI Specification v1.0
 * @see API_DOCUMENTATION.md
 */

import type { ApiResponse } from './common';
import type { SupplierResponse } from './supplier';

// ============================================================================
// Product Models
// ============================================================================

export interface Product {
  id: string;
  store_id: string;
  category_id: string;
  name: string;
  description?: string;
  currency: string;
  has_variation: boolean;
  ratings: number;
  supplier: string[];
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Request Types
// ============================================================================

export interface ProductCreateRequest {
  name: string; // Required, 1-255 chars
  categoryId: string; // Required, UUID
  description?: string; // Optional, 0-1000 chars
  currency?: string; // Optional, 0-500 chars, default: VND
  hasVariation?: boolean; // Optional
}

export interface ProductUpdateRequest {
  name: string; // Required, 1-255 chars
  description?: string; // Optional, 0-1000 chars
  categoryId?: string; // Optional, UUID
  currency?: string; // Optional, 0-500 chars
  hasVariation?: boolean; // Optional
}

// ============================================================================
// Response Types
// ============================================================================

export interface ProductResponse {
  id: string;
  store_id: string;
  category_name: string;
  name: string;
  description?: string;
  currency: string;
  has_variation: boolean;
  ratings: number;
  suppliers: SupplierResponse[]; // Updated to match API documentation
  created_at: string;
  updated_at: string;
}

export interface PageResponseProduct {
  content: ProductResponse[];
  total_elements: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  is_first: boolean;
  is_last: boolean;
  is_empty: boolean;
  has_next: boolean;
  has_previous: boolean;
}

// ============================================================================
// API Response Wrappers
// ============================================================================

export type ProductApiResponse = ApiResponse<ProductResponse>;
export type ProductListApiResponse = ApiResponse<PageResponseProduct>;

// ============================================================================
// Query Parameters
// ============================================================================

export interface ProductListParams {
  page?: number; // Default: 0
  size?: number; // Default: 20
  searchTerm?: string; // Optional search term
  categoryId?: string; // Optional category filter
}

// ============================================================================
// Form Types (for UI)
// ============================================================================

export interface ProductFormData {
  name: string;
  categoryId: string;
  description?: string;
  currency?: string;
  hasVariation?: boolean;
}

export interface ProductFormErrors {
  name?: string;
  categoryId?: string;
  description?: string;
  currency?: string;
  general?: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export type ProductStatus = 'active' | 'inactive' | 'out_of_stock';

// ============================================================================
// Legacy Types (for backward compatibility)
// ============================================================================

export interface FilterOptions {
  priceMin?: number;
  priceMax?: number;
  stockMin?: number;
  stockMax?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface LegacyProduct {
  id: string;
  name: string;
  price: number;
  unit?: string;
  stock: number;
  status: ProductStatus;
  cost?: number;
  createdAt: string;
  updatedAt?: string;
  image?: string;
  abbreviation?: string;
  sku?: string;
  barcode?: string;
  categoryId?: string;
  category?: string;
  supplierId?: string;
  supplier?: string;
  description?: string;
  internalNotes?: string;
  images?: string[];
  isBestseller?: boolean;
}

