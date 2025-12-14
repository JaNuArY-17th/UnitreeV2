/**
 * Shared API types and interfaces
 */

// Base API Response structure
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// API Error structure
export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

// HTTP Status Codes
export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
}

// Request/Response metadata
export interface RequestMetadata {
  timestamp: number;
  requestId?: string;
  userAgent?: string;
  clientVersion?: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Common API request options
export interface ApiRequestOptions {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

// File upload types
export interface FileUploadRequest {
  file: File | Blob;
  filename?: string;
  contentType?: string;
}

export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  contentType: string;
  uploadedAt: string;
}

// Search and filter types
export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  pagination?: PaginationParams;
}

export interface FilterOption {
  label: string;
  value: string | number;
  count?: number;
}

// Validation error structure
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationErrorResponse extends ApiError {
  errors: Record<string, string[]>;
  validationErrors?: ValidationError[];
}

// Generic list response
export interface ListResponse<T> extends PaginatedResponse<T> {
  filters?: FilterOption[];
  sorting?: {
    field: string;
    direction: 'asc' | 'desc';
  }[];
}

// Health check response
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  services?: Record<string, 'up' | 'down'>;
}

// Export commonly used type combinations
export type ApiSuccessResponse<T> = ApiResponse<T> & { success: true; data: T };
export type ApiErrorResponse = ApiResponse<never> & { success: false; message: string };
export type ApiResult<T> = ApiSuccessResponse<T> | ApiErrorResponse;
