import { useState, useCallback } from 'react'
import { voucherService } from '../services/voucherService'
import type {
  VoucherCampaignResponse,
  VoucherListParams,
  VoucherStatus,
} from '../types/voucherTypes'

export const useVoucherList = () => {
  const [vouchers, setVouchers] = useState<VoucherCampaignResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  })

  /**
   * Fetch vouchers with filters
   */
  const fetchVouchers = useCallback(
    async (params?: VoucherListParams, isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setError(null)

      try {
        const response = await voucherService.getVouchers({
          page: params?.page ?? 0,
          size: params?.size ?? 20,
          status: params?.status,
          search: params?.search,
        })

        if (response.success && response.data) {
          setVouchers(response.data.content)
          setPagination({
            page: response.data.number,
            size: response.data.size,
            totalElements: response.data.totalElements,
            totalPages: response.data.totalPages,
          })
          console.log('✅ [useVoucherList] Vouchers fetched successfully')
        } else {
          setError(response.message || 'Failed to fetch vouchers')
          console.error('❌ [useVoucherList] Failed to fetch vouchers:', response.message)
        }
      } catch (err: any) {
        const errorMessage = err.message || 'An error occurred while fetching vouchers'
        setError(errorMessage)
        console.error('❌ [useVoucherList] Error fetching vouchers:', err)
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [],
  )

  /**
   * Refresh vouchers list
   */
  const refreshVouchers = useCallback(
    async (params?: VoucherListParams) => {
      await fetchVouchers(params, true)
    },
    [fetchVouchers],
  )

  /**
   * Load more vouchers (pagination)
   */
  const loadMoreVouchers = useCallback(
    async (params?: VoucherListParams) => {
      if (pagination.page + 1 < pagination.totalPages && !isLoading) {
        const nextPage = pagination.page + 1
        await fetchVouchers({ ...params, page: nextPage }, false)
      }
    },
    [pagination, isLoading, fetchVouchers],
  )

  /**
   * Delete a voucher
   */
  const deleteVoucher = useCallback(
    async (voucherId: string) => {
      try {
        const response = await voucherService.deleteCampaign(voucherId)

        if (response.success) {
          console.log('✅ [useVoucherList] Voucher deleted successfully')
          // Remove the deleted voucher from the list
          setVouchers(prev => prev.filter(v => v.id !== voucherId))
          return { success: true, message: 'Voucher deleted successfully' }
        } else {
          console.error('❌ [useVoucherList] Failed to delete voucher:', response.message)
          return { success: false, message: response.message || 'Failed to delete voucher' }
        }
      } catch (err: any) {
        const errorMessage = err.message || 'An error occurred while deleting voucher'
        console.error('❌ [useVoucherList] Error deleting voucher:', err)
        return { success: false, message: errorMessage }
      }
    },
    [],
  )

  return {
    vouchers,
    isLoading,
    isRefreshing,
    error,
    pagination,
    fetchVouchers,
    refreshVouchers,
    loadMoreVouchers,
    deleteVoucher,
  }
}
