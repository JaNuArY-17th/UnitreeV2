/**
 * Product Instance API Types
 * Based on ESPay API OpenAPI Specification v1.0
 * @see API_DOCUMENTATION.md
 */

import type { ApiResponse } from './common';
import type { VariationResponse } from './variation';

// ============================================================================
// Instance Models
// ============================================================================

export interface ProductInstance {
  id: string;
  productId: string;
  variationId: string;
  status: InstanceStatus;
  locationId?: string;
  serialNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export type InstanceStatus = 'AVAILABLE' | 'SOLD' | 'RESERVED' | 'DAMAGED' | 'DISPOSED';

// ============================================================================
// Request Types
// ============================================================================

export interface InstanceCreateRequest {
  variationId: string; // Required
  locationId?: string;
  serialNumber?: string;
  status?: InstanceStatus;
}

export interface InstanceUpdateRequest {
  locationId?: string;
  serialNumber?: string;
  status?: InstanceStatus;
}

// ============================================================================
// Response Types
// ============================================================================

export interface ProductDto {
  id: string;
  name: string;
  description?: string;
  storeId: string;
  categoryId: string;
  currency: string;
  hasVariation: boolean;
}

export interface LocationDto {
  id: string;
  storeId: string;
  name: string;
  code?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InstanceResponse {
  id: string;
  productId: string;
  variationId: string;
  status: InstanceStatus;
  locationId?: string;
  serialNumber?: string;
  createdAt: string;
  updatedAt: string;
  product?: ProductDto;
  variation?: VariationResponse;
  location?: LocationDto;
}

// ============================================================================
// API Response Wrappers
// ============================================================================

export type InstanceApiResponse = ApiResponse<InstanceResponse>;
export type InstanceListApiResponse = ApiResponse<InstanceResponse[]>;

// ============================================================================
// Form Types (for UI)
// ============================================================================

export interface InstanceFormData {
  variationId: string;
  locationId?: string;
  serialNumber?: string;
  status?: InstanceStatus;
}

export interface InstanceFormErrors {
  variationId?: string;
  locationId?: string;
  serialNumber?: string;
  status?: string;
  general?: string;
}

