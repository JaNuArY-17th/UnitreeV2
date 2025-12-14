/**
 * Inventory Types and Interfaces
 */

export interface InventoryTransaction {
  transactionId: string;
  productId: string;
  productName: string;
  productVariationId: string;
  variationName: string;
  transactionType: 'IMPORT' | 'EXPORT' | 'ADJUSTMENT' | 'SALE' | 'RETURN' | 'RECONCILE';
  quantityChange: number;
  currentStock: number;
  relatedEntityId: string;
  referenceNumber?: string;
  notes: string;
  createdAt: string;
  createdBy?: string;
}

export interface InventoryHistoryResponse {
  success: boolean;
  message?: string;
  data: InventoryTransaction[];
}

export interface InventoryPaper {
  id: string;
  code: string;
  name: string;
  type: 'IMPORT' | 'EXPORT' | 'RECONCILE';
  status: 'PENDING' | 'COMPLETE' | 'CANCEL';
  storeId: string;
  createdAt: string;
  createdBy?: string;
  createdUser?: string;
  notes?: string;
  items?: InventoryPaperItem[];
  differenceCount?: number;
}

export interface InventoryPaperItem {
  productVariationId: string;
  productName: string;
  variationName?: string;
  quantity: number;
  currentStock?: number;
  quantityChange?: number;
  notes?: string;
}

export interface InventoryPapersResponse {
  success: boolean;
  message?: string;
  data: {
    content?: InventoryPaper[];
  } | InventoryPaper[];
}

export interface InventoryPaperDetailResponse {
  success: boolean;
  message?: string;
  data: {
    paper: InventoryPaper;
    transactions: InventoryTransaction[];
  };
}

export interface InventoryImportExportRequest {
  name: string;
  type: 'IMPORT' | 'EXPORT';
  notes?: string;
  relatedEntityId?: string;
  items: {
    productVariationId: string;
    quantity: number;
    notes?: string;
  }[];
}

export interface StockCheckRequest {
  name: string;
  notes?: string;
  relatedEntityId?: string;
  items: {
    productVariationId: string;
    actualQuantity: number;
  }[];
}

export interface ProductSearchResult {
  productVariationId: string;
  productId: string;
  productName: string;
  variationName?: string;
  sku: string;
  currentStock: number;
  price?: number;
}

export interface ProductSearchResponse {
  success: boolean;
  message?: string;
  data: ProductSearchResult[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}
