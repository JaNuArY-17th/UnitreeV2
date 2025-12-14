/**
 * Hook to fetch and manage vouchers for an order
 */
import { useQuery } from '@tanstack/react-query'
import { voucherService } from '../services/voucherService'

/**
 * Hook to get vouchers available for a specific order
 * @param orderId - Order ID (UUID)
 * @param enabled - Whether to fetch data
 */
export const useOrderVouchers = (orderId?: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['orderVouchers', orderId],
    queryFn: () => {
      if (!orderId) {
        throw new Error('Order ID is required')
      }
      return voucherService.checkVouchersForOrder(orderId)
    },
    enabled: enabled && !!orderId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
