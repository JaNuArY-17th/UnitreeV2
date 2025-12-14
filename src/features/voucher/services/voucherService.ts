/**
 * Voucher Service
 * Handles all voucher-related API calls
 */

import { apiClient } from '@/shared/utils/axios'
import type {
  VoucherApiResponse,
  VoucherListApiResponse,
  VoucherCreateRequest,
  VoucherUpdateRequest,
  VoucherListParams,
  VoucherCodeCheckResponse,
  UserVoucherApiResponse,
  UserVoucherListApiResponse,
  VoucherStatsApiResponse,
  VoucherApplyRequest,
  VoucherApplyApiResponse,
  VoucherDiscountCalculateRequest,
  VoucherDiscountCalculateApiResponse,
  VoucherAvailabilityApiResponse,
  VoucherAvailabilityItem,
  UserVoucherListParams,
  AvailableVouchersParams,
} from '../types/voucherTypes'

// API base paths
const STORE_BASE_PATH = '/pay/v1/stores/vouchers'
const USER_BASE_PATH = '/pay/v1/vouchers'

/**
 * Build voucher endpoints
 */
const getVoucherEndpoints = () => ({
  // Store endpoints
  LIST: STORE_BASE_PATH,
  DETAIL: (campaignId: string) => `${STORE_BASE_PATH}/${campaignId}`,
  CREATE: STORE_BASE_PATH,
  UPDATE: (campaignId: string) => `${STORE_BASE_PATH}/${campaignId}`,
  DELETE: (campaignId: string) => `${STORE_BASE_PATH}/${campaignId}`,
  CHECK_CODE: (code: string) =>
    `${STORE_BASE_PATH}/check-code?code=${encodeURIComponent(code)}`,

  // User endpoints
  MY_VOUCHERS: `${USER_BASE_PATH}/my-vouchers`,
  MY_VOUCHER_DETAIL: (userVoucherId: string) =>
    `${USER_BASE_PATH}/my-vouchers/${userVoucherId}`,
  STATS: `${USER_BASE_PATH}/stats`,
  AVAILABLE_VOUCHERS: `${USER_BASE_PATH}/available`,
  CAMPAIGN_DETAIL: (campaignId: string) =>
    `${USER_BASE_PATH}/campaigns/${campaignId}`,
  SAVE_VOUCHER: (campaignId: string) =>
    `${USER_BASE_PATH}/save/${campaignId}`,
  APPLY_VOUCHER: `${USER_BASE_PATH}/apply`,
  CALCULATE_DISCOUNT: `${USER_BASE_PATH}/calculate-discount`,
  CHECK_VOUCHERS_FOR_ORDER: (orderId: string) =>
    `${USER_BASE_PATH}/check/${orderId}`,
})

/**
 * Voucher Service
 */
export const voucherService = {
  /**
   * Get list of voucher campaigns
   * GET /api/v1/stores/vouchers
   * @param params - Query parameters (status, search, page, size)
   */
  getVouchers: async (
    params?: VoucherListParams,
  ): Promise<VoucherListApiResponse> => {
    const endpoints = getVoucherEndpoints()
    const queryParams = new URLSearchParams()

    queryParams.append('page', (params?.page ?? 0).toString())
    queryParams.append('size', (params?.size ?? 20).toString())

    if (params?.status) {
      queryParams.append('status', params.status)
    }
    if (params?.search) {
      queryParams.append('search', params.search)
    }

    const response = await apiClient.get<VoucherListApiResponse>(
      `${endpoints.LIST}?${queryParams.toString()}`,
    )
    return response.data as VoucherListApiResponse
  },

  /**
   * Get voucher campaign details
   * GET /api/v1/stores/vouchers/{campaignId}
   * @param campaignId - Campaign ID (UUID)
   */
  getCampaign: async (campaignId: string): Promise<VoucherApiResponse> => {
    const endpoints = getVoucherEndpoints()
    const response = await apiClient.get<VoucherApiResponse>(
      endpoints.DETAIL(campaignId),
    )
    return response.data as VoucherApiResponse
  },

  /**
   * Store creates new voucher campaign
   * POST /api/v1/stores/vouchers
   *
   * **Permissions:** Store (can only create vouchers for their own store)
   *
   * **Discount types:**
   * • PERCENTAGE: Discount by percentage, has maxDiscount
   * • AMOUNT: Fixed amount discount
   *
   * **Validation rules:**
   * • Voucher code: 3-50 characters, uppercase letters, numbers, hyphens and underscores only, must be unique
   * • discountValue > 0
   * • validFrom < validTo
   *
   * @param data - Voucher creation data
   */
  createCampaign: async (
    data: VoucherCreateRequest,
  ): Promise<VoucherApiResponse> => {
    const endpoints = getVoucherEndpoints()
    const response = await apiClient.post<VoucherApiResponse>(
      endpoints.CREATE,
      data,
    )
    return response.data as VoucherApiResponse
  },

  /**
   * Store updates voucher campaign
   * PUT /api/v1/stores/vouchers/{campaignId}
   *
   * **Permissions:** Store (can only update their own vouchers)
   *
   * **Updatable fields:**
   * • name, description, imageUrl
   * • maxDiscount, minOrderValue, maxUsagePerUser
   * • totalQuantity (can only increase)
   * • validTo (can only extend)
   * • status (ACTIVE/INACTIVE)
   *
   * @param campaignId - Campaign ID (UUID)
   * @param data - Voucher update data
   */
  updateCampaign: async (
    campaignId: string,
    data: VoucherUpdateRequest,
  ): Promise<VoucherApiResponse> => {
    const endpoints = getVoucherEndpoints()
    const response = await apiClient.put<VoucherApiResponse>(
      endpoints.UPDATE(campaignId),
      data,
    )
    return response.data as VoucherApiResponse
  },

  /**
   * Store deletes/deactivates voucher campaign
   * DELETE /api/v1/stores/vouchers/{campaignId}
   *
   * **Permissions:** Store (can only delete their own vouchers)
   *
   * **Result:**
   * • Status changes to INACTIVE
   * • Campaign is not deleted from database
   * • Users who saved the voucher keep it but cannot use it
   *
   * @param campaignId - Campaign ID (UUID)
   */
  deleteCampaign: async (
    campaignId: string,
  ): Promise<{ success: boolean; message: string; data: null; code: number }> => {
    const endpoints = getVoucherEndpoints()
    const response = await apiClient.delete(endpoints.DELETE(campaignId))
    return response.data as {
      success: boolean
      message: string
      data: null
      code: number
    }
  },

  /**
   * Check if voucher code already exists
   * GET /api/v1/stores/vouchers/check-code?code={code}
   *
   * **Usage:** When creating a new voucher to validate code is not duplicate
   *
   * @param code - Voucher code to check
   * @returns true if code exists, false if available
   */
  checkCodeExists: async (code: string): Promise<VoucherCodeCheckResponse> => {
    const endpoints = getVoucherEndpoints()
    const response = await apiClient.get<VoucherCodeCheckResponse>(
      endpoints.CHECK_CODE(code),
    )
    return response.data as VoucherCodeCheckResponse
  },

  // ===== USER ENDPOINTS =====

  /**
   * Get list of available vouchers (campaigns)
   * GET /api/v1/vouchers/available
   *
   * **Description:** Get all available voucher campaigns that users can save
   *
   * **Conditions for available vouchers:**
   * • Status = ACTIVE
   * • Within validity period (validFrom <= now <= validTo)
   * • Has remaining quantity (remainingQuantity > 0 or null)
   *
   * @param params - Query parameters (search, page, size)
   */
  getAvailableVouchers: async (
    params?: AvailableVouchersParams,
  ): Promise<VoucherListApiResponse> => {
    const endpoints = getVoucherEndpoints()
    const queryParams = new URLSearchParams()

    queryParams.append('page', (params?.page ?? 0).toString())
    queryParams.append('size', (params?.size ?? 20).toString())

    if (params?.search) {
      queryParams.append('search', params.search)
    }

    const response = await apiClient.get<VoucherListApiResponse>(
      `${endpoints.AVAILABLE_VOUCHERS}?${queryParams.toString()}`,
    )
    return response.data as VoucherListApiResponse
  },

  /**
   * Get campaign detail
   * GET /api/v1/vouchers/campaigns/{campaignId}
   *
   * **Description:** Get detailed information of a voucher campaign
   *
   * **Usage:** When user wants to view details before saving a voucher
   *
   * @param campaignId - Campaign ID (UUID)
   */
  getCampaignDetailForUser: async (
    campaignId: string,
  ): Promise<VoucherApiResponse> => {
    const endpoints = getVoucherEndpoints()
    const response = await apiClient.get<VoucherApiResponse>(
      endpoints.CAMPAIGN_DETAIL(campaignId),
    )
    return response.data as VoucherApiResponse
  },

  /**
   * Save voucher to wallet (by campaign ID)
   * POST /api/v1/vouchers/save/{campaignId}
   *
   * **Description:** User saves a voucher campaign to their wallet
   *
   * **Process:**
   * 1. Check if campaign is valid and available
   * 2. Check if user has already saved this voucher (one campaign per user)
   * 3. Check targetUserList (if exists)
   * 4. Decrease remainingQuantity of campaign
   * 5. Create UserVoucher with status = SAVED
   *
   * **Conditions:**
   * • Campaign must be ACTIVE and within validity period
   * • Has remaining vouchers
   * • User hasn't saved this voucher before
   * • User is in targetUserList (if campaign has restrictions)
   *
   * @param campaignId - Campaign ID to save
   */
  saveVoucher: async (
    campaignId: string,
  ): Promise<UserVoucherApiResponse> => {
    const endpoints = getVoucherEndpoints()
    const response = await apiClient.post<UserVoucherApiResponse>(
      endpoints.SAVE_VOUCHER(campaignId),
    )
    return response.data as UserVoucherApiResponse
  },

  /**
   * Get my vouchers list
   * GET /api/v1/vouchers/my-vouchers
   *
   * **Description:** Get list of all vouchers that user has saved
   *
   * **Filters:**
   * • status (optional): Filter by status
   *   - SAVED: Vouchers that can be used
   *   - USED: Vouchers that have been used
   *   - EXPIRED: Vouchers that have expired
   *
   * **Pagination:**
   * • page: Current page (starts from 0)
   * • size: Items per page (default 20)
   *
   * **Sorting:** By received time (receivedAt DESC)
   *
   * @param params - Query parameters (status, search, page, size)
   */
  getMyVouchers: async (
    params?: UserVoucherListParams,
  ): Promise<UserVoucherListApiResponse> => {
    const endpoints = getVoucherEndpoints()
    const queryParams = new URLSearchParams()

    queryParams.append('page', (params?.page ?? 0).toString())
    queryParams.append('size', (params?.size ?? 20).toString())

    if (params?.status) {
      queryParams.append('status', params.status)
    }
    if (params?.search) {
      queryParams.append('search', params.search)
    }

    const response = await apiClient.get<UserVoucherListApiResponse>(
      `${endpoints.MY_VOUCHERS}?${queryParams.toString()}`,
    )
    return response.data as UserVoucherListApiResponse
  },

  /**
   * Get my voucher detail
   * GET /api/v1/vouchers/my-vouchers/{userVoucherId}
   *
   * **Description:** Get detailed information of a voucher that user has saved
   *
   * @param userVoucherId - User voucher ID (UUID)
   */
  getMyVoucherDetail: async (
    userVoucherId: string,
  ): Promise<UserVoucherApiResponse> => {
    const endpoints = getVoucherEndpoints()
    const response = await apiClient.get<UserVoucherApiResponse>(
      endpoints.MY_VOUCHER_DETAIL(userVoucherId),
    )
    return response.data as UserVoucherApiResponse
  },

  /**
   * Delete saved voucher
   * DELETE /api/v1/vouchers/my-vouchers/{userVoucherId}
   *
   * **Description:** Delete a saved voucher from wallet (only for SAVED vouchers)
   *
   * **Conditions:**
   * • Can only delete vouchers with status = SAVED
   * • Cannot delete USED or EXPIRED vouchers
   *
   * **Result:**
   * • UserVoucher is deleted from database
   * • remainingQuantity of campaign increases by 1
   *
   * @param userVoucherId - User voucher ID to delete
   */
  deleteMyVoucher: async (
    userVoucherId: string,
  ): Promise<{ success: boolean; message: string; data: null; code: number }> => {
    const endpoints = getVoucherEndpoints()
    const response = await apiClient.delete(
      endpoints.MY_VOUCHER_DETAIL(userVoucherId),
    )
    return response.data as {
      success: boolean
      message: string
      data: null
      code: number
    }
  },

  /**
   * Get my voucher statistics
   * GET /api/v1/vouchers/stats
   *
   * **Description:** Get overview statistics of user's vouchers
   *
   * **Statistics include:**
   * • total: Total number of vouchers saved
   * • saved: Number of vouchers that can be used
   * • used: Number of vouchers that have been used
   * • expired: Number of vouchers that have expired
   */
  getMyVoucherStats: async (): Promise<VoucherStatsApiResponse> => {
    const endpoints = getVoucherEndpoints()
    const response = await apiClient.get<VoucherStatsApiResponse>(
      endpoints.STATS,
    )
    return response.data as VoucherStatsApiResponse
  },

  /**
   * Apply voucher to order (check)
   * POST /api/v1/vouchers/apply
   *
   * **Description:** Check if voucher can be applied to order and calculate discount amount
   *
   * **Process:**
   * 1. Check campaign is ACTIVE and valid
   * 2. Check order meets minOrderValue
   * 3. Check storeId (if voucher is for specific store)
   * 4. Check user has saved this voucher
   * 5. Check user hasn't exceeded maxUsagePerUser
   * 6. Calculate discount amount
   *
   * **Discount calculation:**
   * • PERCENT: discount = orderAmount * (discountValue / 100), max maxDiscount
   * • AMOUNT: discount = discountValue
   *
   * **Note:**
   * • This API only checks and calculates, does NOT actually use the voucher
   * • To use voucher in actual transaction, Payment Service will call useVoucher()
   *
   * @param data - Order information and voucher code
   */
  applyVoucher: async (
    data: VoucherApplyRequest,
  ): Promise<VoucherApplyApiResponse> => {
    const endpoints = getVoucherEndpoints()
    const response = await apiClient.post<VoucherApplyApiResponse>(
      endpoints.APPLY_VOUCHER,
      data,
    )
    return response.data as VoucherApplyApiResponse
  },

  /**
   * Calculate voucher discount
   * POST /api/v1/vouchers/calculate-discount
   *
   * **Description:** Calculate discount amount for a voucher on an order
   *
   * @param data - Voucher and order information for calculation
   */
  calculateDiscount: async (
    data: VoucherDiscountCalculateRequest,
  ): Promise<VoucherDiscountCalculateApiResponse> => {
    const endpoints = getVoucherEndpoints()
    const response = await apiClient.post<VoucherDiscountCalculateApiResponse>(
      endpoints.CALCULATE_DISCOUNT,
      data,
    )
    return response.data as VoucherDiscountCalculateApiResponse
  },

  /**
   * Check vouchers available for order
   * GET /api/v1/vouchers/check/{orderId}
   *
   * **Description:** Check list of user's vouchers that can be used for an order
   *
   * **Conditions for usable voucher:**
   * • Status = ACTIVE
   * • (storeId = null OR storeId = order.storeId)
   * • orderAmount >= minOrderValue
   *
   * **Response:**
   * • usableVouchers: List of vouchers that can be used
   * • unusableVouchers: List of vouchers that cannot be used (with reasons)
   *
   * @param orderId - Order ID (UUID)
   */
  checkVouchersForOrder: async (
    orderId: string,
  ): Promise<VoucherAvailabilityApiResponse> => {
    console.log('🔄 [VoucherService] Checking vouchers for order:', orderId)
    const endpoints = getVoucherEndpoints()
    const url = endpoints.CHECK_VOUCHERS_FOR_ORDER(orderId)
    console.log('🔍 [VoucherService] API URL:', url)
    try {
      const response = await apiClient.get<any>(url)
      console.log('✅ [VoucherService] API response:', response.data)
      console.log('🔍 [VoucherService] response.data.data:', response.data.data)
      console.log('🔍 [VoucherService] usable_vouchers array:', response.data.data?.usable_vouchers)

      // Transform voucher object from API format to app format
      const transformVoucher = (apiVoucher: any): VoucherAvailabilityItem => {
        console.log('🔄 [VoucherService] Transforming voucher:', apiVoucher)
        return {
          id: apiVoucher.id,
          campaignId: apiVoucher.campaignId || apiVoucher.campaign_id,
          campaignName: apiVoucher.voucherName || apiVoucher.voucher_name,
          code: apiVoucher.voucherCode || apiVoucher.voucher_code,
          status: apiVoucher.status,
          remainingUsageCount:
            apiVoucher.remainingUsageCount || apiVoucher.remaining_usage_count,
          maxUsagePerUser:
            apiVoucher.maxUsagePerUser || apiVoucher.max_usage_per_user,
        }
      }

      // Transform snake_case to camelCase
      const rawUsableVouchers = response.data.data?.usable_vouchers || []
      const rawUnusableVouchers = response.data.data?.unusable_vouchers || []

      console.log('🔍 [VoucherService] rawUsableVouchers length:', rawUsableVouchers.length)
      console.log('🔍 [VoucherService] rawUnusableVouchers length:', rawUnusableVouchers.length)

      const usableVouchers = rawUsableVouchers.map(transformVoucher)
      const unusableVouchers = rawUnusableVouchers.map((item: any) => ({
        voucher: transformVoucher(item.voucher),
        reason: item.reason,
        reasonCode: item.reason_code || item.reasonCode,
      }))

      console.log('✅ [VoucherService] Transformed usableVouchers length:', usableVouchers.length)
      console.log('✅ [VoucherService] Transformed unusableVouchers length:', unusableVouchers.length)

      const transformedData: VoucherAvailabilityApiResponse = {
        success: response.data.success,
        message: response.data.message,
        code: response.data.code,
        data: {
          usableVouchers,
          unusableVouchers,
        },
      }

      console.log('✅ [VoucherService] Transformed data:', transformedData)
      return transformedData
    } catch (error) {
      console.error('❌ [VoucherService] API error:', error)
      throw error
    }
  },
}
