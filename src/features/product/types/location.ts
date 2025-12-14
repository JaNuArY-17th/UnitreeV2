/**
 * Location API Types
 * Based on ESPay API OpenAPI Specification v1.0
 * @see API_DOCUMENTATION.md
 */

import type { ApiResponse } from './common';

// ============================================================================
// Location Models
// ============================================================================

export interface Location {
  id: string;
  store_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Request Types
// ============================================================================

export interface LocationCreateRequest {
  name: string; // Required, 1-255 chars
  description?: string; // Optional, 0-1000 chars
}

export interface LocationUpdateRequest {
  name: string; // Required, 1-255 chars
  description?: string; // Optional, 0-1000 chars
}

// ============================================================================
// Response Types
// ============================================================================

export interface LocationResponse {
  id: string;
  store_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface PageResponseLocation {
  content: LocationResponse[];
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

export type LocationApiResponse = ApiResponse<LocationResponse>;
export type LocationListApiResponse = ApiResponse<PageResponseLocation>;

// ============================================================================
// Query Parameters
// ============================================================================

export interface LocationListParams {
  page?: number; // Default: 0
  size?: number; // Default: 20
  searchTerm?: string; // Optional search term
}

// ============================================================================
// Form Types (for UI)
// ============================================================================

export interface LocationFormData {
  name: string;
  description?: string;
}

export interface LocationFormErrors {
  name?: string;
  description?: string;
  general?: string;
}

