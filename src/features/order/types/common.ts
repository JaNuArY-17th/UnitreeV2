/**
 * Common API Types
 * Shared types used across order feature
 */

// ============================================================================
// API Response Wrappers
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  code?: number;
}

export interface ApiVoidResponse {
  success: boolean;
  message: string;
  data: null;
  code: number;
}

export interface ApiListResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  count: number;
}
