/**
 * Category API Types
 * Based on ESPay API OpenAPI Specification v1.0
 * @see API_DOCUMENTATION.md
 */

import type { ApiResponse } from './common';

// ============================================================================
// Category Models
// ============================================================================

export interface Category {
  id: string;
  name: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Request Types
// ============================================================================

export interface CategoryCreateRequest {
  name: string; // Required, 1-255 chars
}

export interface CategoryUpdateRequest {
  name: string; // Required, 1-255 chars
}

// ============================================================================
// Response Types
// ============================================================================

export interface CategoryResponse {
  id: string;
  name: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageResponseCategory {
  content: CategoryResponse[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

// ============================================================================
// API Response Wrappers
// ============================================================================

export type CategoryApiResponse = ApiResponse<CategoryResponse>;
export type CategoryListApiResponse = ApiResponse<PageResponseCategory>;

// ============================================================================
// Query Parameters
// ============================================================================

export interface CategoryListParams {
  page?: number; // Default: 0
  size?: number; // Default: 20
  searchTerm?: string; // Optional search term
}

// ============================================================================
// Form Types (for UI)
// ============================================================================

export interface CategoryFormData {
  name: string;
}

export interface CategoryFormErrors {
  name?: string;
  general?: string;
}

