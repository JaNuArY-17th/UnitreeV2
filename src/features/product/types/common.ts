/**
 * Common API Types
 * Shared types used across product, category, variation, instance, supplier, location
 */

// ============================================================================
// API Response Wrappers
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  code: number;
}

export interface ApiVoidResponse {
  success: boolean;
  message: string;
  data: null;
  code: number;
}

