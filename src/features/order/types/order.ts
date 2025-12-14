/**
 * Order API Types
 * Based on POS Order Management API
 */

import type { ApiResponse, ApiListResponse } from './common';

// ============================================================================
// Enums
// ============================================================================

export type PaymentMethod = 'CASH' | 'TRANSFER';
export type OrderStatus = 'PENDING' | 'PAID';

// ============================================================================
// Order Models
// ============================================================================

export interface Customer {
  id: string;
  storeId: string;
  ownerId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  firstPurchase: string;
  lastPurchase: string;
  createdAt: string;
  updatedAt: string;
  totalOrders: number;
  totalSpent: number;
}

export interface OrderItem {
  id: string;
  orderId?: string;
  productVariationId: string;
  productVariation?: any; // Product variation details
  name?: string; // Product name
  unit?: string; // Product unit (e.g., "Chai")
  quantity: number;
  unitPrice: number;
  totalLineAmount: number;
  discountAmount: number;
  finalLineAmount: number;
  createdAt?: string;
}

export interface OrderVoiceItem {
  itemName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalLineAmount: number;
  discountAmount: number;
  finalLineAmount: number;
}

export interface PaymentInfo {
  qrCode: string;
  qrDataURL: string;
  qrContent: string;
}

export interface Order {
  id: string;
  storeId: string;
  customerId: string;
  orderSequence: string;
  orderDate: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: PaymentMethod;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  itemsVoice?: OrderVoiceItem[];
  customer: Customer;
  websocketUrl: string;
  paymentInfo: PaymentInfo;
}

// ============================================================================
// Request Types
// ============================================================================

export interface OrderItemCreateRequest {
  productVariationId: string;
  quantity: number;
  unitPrice: number;
  totalLineAmount: number;
  discountAmount?: number;
  finalLineAmount: number;
}

export interface VoiceItemCreateRequest {
  itemName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalLineAmount: number;
  discountAmount: number;
  finalLineAmount: number;
}

export interface OrderCreateRequest {
  storeId: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  paymentMethod: PaymentMethod;
  items: OrderItemCreateRequest[];
  itemsVoice?: VoiceItemCreateRequest[]; // Items added via voice input
  totalAmount: number;
  discountAmount?: number;
  finalAmount: number;
  notes?: string;
}

// ============================================================================
// Response Types
// ============================================================================

export type OrderApiResponse = ApiResponse<Order>;
export type OrderListApiResponse = ApiListResponse<Order>;

// ============================================================================
// Query Parameters
// ============================================================================

export interface OrderListParams {
  page?: number;
  size?: number;
  orderSequence?: string;
}

// ============================================================================
// Form Types (for UI)
// ============================================================================

export interface OrderFormData {
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  paymentMethod: PaymentMethod;
  items: OrderItemCreateRequest[];
  discountAmount?: number;
  notes?: string;
}

export interface OrderFormErrors {
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  paymentMethod?: string;
  items?: string;
  discountAmount?: string;
  general?: string;
}
