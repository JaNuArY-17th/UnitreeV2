/**
 * useOrderMutations Hook
 * React Query mutations for order operations (create)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../services/orderService';
import { ORDER_QUERY_KEYS } from './useOrders';
import type { OrderCreateRequest } from '../types/order';

/**
 * Hook for creating a new order
 */
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OrderCreateRequest) => {
      return await orderService.createOrder(data);
    },
    onSuccess: () => {
      // Invalidate and refetch orders list
      queryClient.invalidateQueries({
        queryKey: ORDER_QUERY_KEYS.lists(),
      });
    },
    onError: (error: any) => {
      console.error('Create order error:', error);
    },
  });
};

/**
 * All order mutations in one hook
 */
export const useOrderMutations = () => {
  const createOrder = useCreateOrder();

  return {
    createOrder,
  };
};
