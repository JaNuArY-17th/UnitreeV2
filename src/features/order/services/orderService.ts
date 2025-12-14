/**
 * Order Service
 * Handles all order-related API calls
 */

import { apiClient } from '@/shared/utils/axios';
import type {
  OrderApiResponse,
  OrderListApiResponse,
  OrderCreateRequest,
  OrderListParams,
} from '../types/order';

// API base path - Gateway endpoint for orders
const BASE_PATH = '/pay/v1/pos/orders';

/**
 * Order Service
 */
export const orderService = {
  /**
   * Get orders list
   * @param params - Query parameters (page, size)
   */
  getOrders: async (
    params?: OrderListParams
  ): Promise<OrderListApiResponse> => {
    const response = await apiClient.get<OrderListApiResponse>(BASE_PATH + '/store', {
      params: {
        page: params?.page,
        size: params?.size,
        orderSequence: params?.orderSequence,
      },
    });
    return response.data as OrderListApiResponse;
  },

  /**
   * Get order by ID
   * @param orderId - Order ID (UUID)
   */
  getOrderById: async (
    orderId: string
  ): Promise<OrderApiResponse> => {
    const response = await apiClient.get<OrderApiResponse>(
      `${BASE_PATH}/${orderId}`
    );
    return response.data as OrderApiResponse;
  },

  /**
   * Create new order
   * @param data - Order creation data
   */
  createOrder: async (
    data: OrderCreateRequest
  ): Promise<OrderApiResponse> => {
    const response = await apiClient.post<OrderApiResponse>(
      BASE_PATH,
      data
    );
    return response.data as OrderApiResponse;
  },
};
