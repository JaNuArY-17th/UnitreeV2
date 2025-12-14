/**
 * Supplier API Types
 * Based on ESPay API OpenAPI Specification v1.0
 * @see API_DOCUMENTATION.md
 */

import type { ApiResponse } from './common';

// ============================================================================
// Supplier Models
// ============================================================================

export interface Supplier {
  id: string;
  store_id: string;
  name: string;
  contact_info?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Request Types
// ============================================================================

export interface SupplierCreateRequest {
  name: string; // Required, 1-255 chars
  contactInfo?: string; // Optional, 0-1000 chars
}

export interface SupplierUpdateRequest {
  name?: string; // Optional, 1-255 chars
  contactInfo?: string; // Optional, 0-1000 chars
}

// ============================================================================
// Response Types
// ============================================================================

export interface SupplierResponse {
  id: string;
  store_id: string;
  name: string;
  contact_info?: string;
  created_at: string;
  updated_at: string;
}

export interface PageResponseSupplier {
  content: SupplierResponse[];
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

export type SupplierApiResponse = ApiResponse<SupplierResponse>;
export type SupplierListApiResponse = ApiResponse<PageResponseSupplier>;

// ============================================================================
// Query Parameters
// ============================================================================

export interface SupplierListParams {
  page?: number; // Default: 0
  size?: number; // Default: 20
  searchTerm?: string; // Optional search term
}

// ============================================================================
// Form Types (for UI)
// ============================================================================

export interface SupplierFormData {
  name: string;
  contactInfo?: string;
}

export interface SupplierFormErrors {
  name?: string;
  contactInfo?: string;
  general?: string;
}

