/**
 * Voucher Types
 * Type definitions for voucher-related features
 */

// Voucher status types
export type VoucherStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'COMPLETED'

// User voucher status types
export type UserVoucherStatus =
  | 'ACTIVE'
  | 'EXPIRED'
  | 'USED_UP'
  | 'DEACTIVATED'

// Voucher discount type
export type VoucherDiscountType = 'PERCENT' | 'AMOUNT'

/**
 * Voucher Campaign Response
 */
export interface VoucherCampaignResponse {
  id: string
  name: string
  description?: string
  code: string
  imageUrl?: string
  discountType: VoucherDiscountType
  discountValue: number
  maxDiscount?: number
  minOrderValue?: number
  totalQuantity: number
  usedQuantity: number
  maxUsagePerUser?: number
  validFrom: string
  validTo: string
  status: VoucherStatus
  creatorId: string
  createdAt: string
  updatedAt: string
}

/**
 * Voucher creation request
 */
export interface VoucherCreateRequest {
  name: string
  description?: string
  code: string
  imageUrl?: string
  discountType: VoucherDiscountType
  discountValue: number
  maxDiscount?: number
  minOrderValue?: number
  totalQuantity: number
  maxUsagePerUser?: number
  validFrom: string
  validTo: string
}

/**
 * Voucher update request
 */
export interface VoucherUpdateRequest {
  name?: string
  description?: string
  imageUrl?: string
  maxDiscount?: number
  minOrderValue?: number
  totalQuantity?: number
  maxUsagePerUser?: number
  validTo?: string
  status?: VoucherStatus
}

/**
 * Voucher list parameters
 */
export interface VoucherListParams {
  status?: VoucherStatus
  search?: string
  page?: number
  size?: number
}

/**
 * Paginated response wrapper
 */
export interface VoucherListResponse {
  content: VoucherCampaignResponse[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  code: number
}

/**
 * Voucher API response
 */
export type VoucherApiResponse = ApiResponse<VoucherCampaignResponse>

/**
 * Voucher list API response
 */
export type VoucherListApiResponse = ApiResponse<VoucherListResponse>

/**
 * Code check API response
 */
export type VoucherCodeCheckResponse = ApiResponse<boolean>

/**
 * User Voucher Response
 */
export interface UserVoucherResponse {
  id: string
  userId: string
  campaignId: string
  voucherName: string
  voucherCode: string
  description?: string
  discountType: VoucherDiscountType
  discountValue: number
  maxDiscount?: number
  minOrderValue?: number
  validFrom: string
  validTo: string
  status: UserVoucherStatus
  receivedAt: string
  remainingUsageCount: number
  usageCount: number
  maxUsagePerUser: number
  imageUrl?: string
  storeId?: string
  isExpired: boolean
  canUse: boolean
}

/**
 * User Voucher API response
 */
export type UserVoucherApiResponse = ApiResponse<UserVoucherResponse>

/**
 * User voucher list API response
 */
export interface UserVoucherListResponse {
  content: UserVoucherResponse[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export type UserVoucherListApiResponse = ApiResponse<UserVoucherListResponse>

/**
 * User voucher stats response
 */
export interface VoucherStatsResponse {
  total: number
  saved: number
  used: number
  expired: number
}

export type VoucherStatsApiResponse = ApiResponse<VoucherStatsResponse>

/**
 * Voucher apply request
 */
export interface VoucherApplyRequest {
  voucherCode: string
  orderAmount: number
  storeId?: string
}

/**
 * Voucher apply response
 */
export interface VoucherApplyResponse {
  campaignId?: string
  voucherCode: string
  voucherName?: string
  originalAmount: number
  discountAmount: number
  finalAmount: number
  isApplied: boolean
  message: string
}

export type VoucherApplyApiResponse = ApiResponse<VoucherApplyResponse>

/**
 * Voucher discount calculate request
 */
export interface VoucherDiscountCalculateRequest {
  voucherId: string
  orderId: string
  originalAmount: number
}

/**
 * Voucher discount calculate response
 */
export interface VoucherDiscountCalculateResponse {
  voucherId: string
  orderId: string
  originalAmount: number
  discountAmount: number
  finalAmount: number
  message: string
}

export type VoucherDiscountCalculateApiResponse =
  ApiResponse<VoucherDiscountCalculateResponse>

/**
 * Voucher availability for order
 */
export interface VoucherAvailabilityItem {
  id: string
  campaignId: string
  campaignName: string
  code: string
  status: UserVoucherStatus
  remainingUsageCount: number
  maxUsagePerUser: number
}

export interface UnusableVoucherItem {
  voucher: VoucherAvailabilityItem
  reason: string
  reasonCode: string
}

export interface VoucherAvailabilityResponse {
  usableVouchers: VoucherAvailabilityItem[]
  unusableVouchers: UnusableVoucherItem[]
}

export type VoucherAvailabilityApiResponse =
  ApiResponse<VoucherAvailabilityResponse>

/**
 * User voucher list parameters
 */
export interface UserVoucherListParams {
  status?: UserVoucherStatus
  search?: string
  page?: number
  size?: number
}

/**
 * Available vouchers list parameters
 */
export interface AvailableVouchersParams {
  search?: string
  page?: number
  size?: number
}
