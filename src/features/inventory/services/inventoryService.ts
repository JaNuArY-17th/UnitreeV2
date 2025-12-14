/**
 * Inventory Service
 * Handles all inventory-related API calls
 */

import { apiClient } from '@/shared/utils/axios';
import type {
  InventoryHistoryResponse,
  InventoryPapersResponse,
  InventoryPaperDetailResponse,
  InventoryImportExportRequest,
  StockCheckRequest,
  ProductSearchResponse,
  ApiResponse,
} from '../types';

// API base path
const BASE_PATH = '/pay/v1/pos/inventory';

/**
 * Build inventory endpoints
 */
const getInventoryEndpoints = () => ({
  HISTORY: `${BASE_PATH}/history`,
  IMPORT: `${BASE_PATH}/import`,
  EXPORT: `${BASE_PATH}/export`,
  PAPERS: `${BASE_PATH}/papers`,
  PAPER_DETAIL: (paperId: string) => `${BASE_PATH}/papers/${paperId}`,
  RECONCILE: `${BASE_PATH}/reconcile`,
  CONFIRM_PAPER: (paperId: string) => `${BASE_PATH}/papers/${paperId}/confirm`,
  CANCEL_PAPER: (paperId: string) => `${BASE_PATH}/papers/${paperId}/cancel`,
  SEARCH: `${BASE_PATH}/search`,
});

/**
 * Inventory Service
 */
export const inventoryService = {
  /**
   * Get inventory transaction history
   * @returns Promise with inventory transaction history
   */
  getInventoryHistory: async (): Promise<InventoryHistoryResponse> => {
    const endpoints = getInventoryEndpoints();
    const response = await apiClient.get<InventoryHistoryResponse>(endpoints.HISTORY);
    return response.data as InventoryHistoryResponse;
  },

  /**
   * Import inventory (Nhập kho)
   * @param data - Import request data
   * @returns Promise with import result
   */
  importInventory: async (data: InventoryImportExportRequest): Promise<ApiResponse> => {
    const endpoints = getInventoryEndpoints();
    const response = await apiClient.post<ApiResponse>(endpoints.IMPORT, data);
    return response.data as ApiResponse;
  },

  /**
   * Export inventory (Xuất kho)
   * @param data - Export request data
   * @returns Promise with export result
   */
  exportInventory: async (data: InventoryImportExportRequest): Promise<ApiResponse> => {
    const endpoints = getInventoryEndpoints();
    const response = await apiClient.post<ApiResponse>(endpoints.EXPORT, data);
    return response.data as ApiResponse;
  },

  /**
   * Get inventory papers (Danh sách phiếu kho)
   * @returns Promise with inventory papers
   */
  getInventoryPapers: async (): Promise<InventoryPapersResponse> => {
    const endpoints = getInventoryEndpoints();
    const response = await apiClient.get<InventoryPapersResponse>(endpoints.PAPERS);
    return response.data as InventoryPapersResponse;
  },

  /**
   * Search products in inventory
   * @param query - Search query (SKU)
   * @returns Promise with search results
   */
  searchInventoryProducts: async (query: string): Promise<ProductSearchResponse> => {
    const endpoints = getInventoryEndpoints();
    const response = await apiClient.get<ProductSearchResponse>(endpoints.SEARCH, {
      params: { sku: query },
    });
    return response.data as ProductSearchResponse;
  },

  /**
   * Create stock check (Tạo phiếu kiểm kho)
   * @param data - StockCheck request data
   * @returns Promise with result
   */
  createStockCheck: async (data: StockCheckRequest): Promise<ApiResponse> => {
    const endpoints = getInventoryEndpoints();
    const response = await apiClient.post<ApiResponse>(endpoints.RECONCILE, data);
    return response.data as ApiResponse;
  },

  /**
   * Get stock check details (Lấy chi tiết phiếu kiểm kho)
   * @param paperId - Paper ID
   * @returns Promise with stock check details
   */
  getStockCheckDetails: async (paperId: string): Promise<InventoryPaperDetailResponse> => {
    const endpoints = getInventoryEndpoints();
    const response = await apiClient.get<InventoryPaperDetailResponse>(
      endpoints.PAPER_DETAIL(paperId)
    );
    return response.data as InventoryPaperDetailResponse;
  },

  /**
   * Confirm stock check (Xác nhận phiếu kiểm kho)
   * @param paperId - Paper ID
   * @returns Promise with status update result
   */
  confirmStockCheck: async (paperId: string): Promise<ApiResponse> => {
    const endpoints = getInventoryEndpoints();
    const response = await apiClient.post<ApiResponse>(
      endpoints.CONFIRM_PAPER(paperId)
    );
    return response.data as ApiResponse;
  },

  /**
   * Cancel stock check (Hủy phiếu kiểm kho)
   * @param paperId - Paper ID
   * @returns Promise with cancel result
   */
  cancelStockCheck: async (paperId: string): Promise<ApiResponse> => {
    const endpoints = getInventoryEndpoints();
    const response = await apiClient.post<ApiResponse>(
      endpoints.CANCEL_PAPER(paperId)
    );
    return response.data as ApiResponse;
  },
};
