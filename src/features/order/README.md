# Order Feature

Order management feature for POS system with complete CRUD operations and WebSocket support for real-time payment updates.

## Overview

This feature provides a complete order management system including:
- Order listing with filtering by status
- Order creation with payment methods (CASH/TRANSFER)
- Real-time payment updates via WebSocket
- Customer information tracking
- QR code payment integration

## API Endpoints

All endpoints use the gateway pattern: `/api/v1/pos/orders`

### GET /api/v1/pos/orders/store/{storeId}
Get all orders for a store
- **Query params**: page, size
- **Response**: List of orders with pagination

### GET /api/v1/pos/orders/{orderId}
Get order by ID
- **Response**: Order details with items, customer, and payment info

### POST /api/v1/pos/orders
Create new order
- **Request body**:
  ```typescript
  {
    storeId: string;
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
    paymentMethod: 'CASH' | 'TRANSFER';
    items: OrderItemCreateRequest[];
    totalAmount: number;
    discountAmount?: number;
    finalAmount: number;
    notes?: string;
  }
  ```
- **Response**: Created order with payment info and WebSocket URL

## Structure

```
src/features/order/
├── types/
│   ├── common.ts          # API response wrappers
│   ├── order.ts           # Order, Customer, PaymentInfo types
│   └── index.ts
├── services/
│   ├── orderService.ts    # API service layer
│   └── index.ts
├── hooks/
│   ├── useOrders.ts       # Fetch orders list
│   ├── useOrder.ts        # Fetch single order
│   ├── useOrderMutations.ts # Create order mutation
│   └── index.ts
├── screens/
│   ├── OrderManagementScreen.tsx
│   └── index.ts
├── components/
│   ├── OrderCard.tsx      # Order list item
│   └── index.ts
├── locales/
│   ├── vi.json
│   └── en.json
└── index.ts
```

## Key Features

### 1. Order Status Filtering
- All orders
- Pending
- Completed
- Cancelled

### 2. Search Functionality
- Search by order sequence
- Search by customer name
- Search by phone number

### 3. Order Card Display
- Order sequence number
- Status badge with color coding
- Customer information
- Payment method
- Item count
- Total amount

### 4. Real-time Updates
Each order includes:
- `websocketUrl`: WebSocket endpoint for payment updates
- `paymentInfo`: QR code data for transfer payments
  - `qrCode`: Base64 QR code image
  - `qrDataURL`: Data URL for display
  - `qrContent`: QR content string

## Navigation

From HomeScreen → QuickAccessCard → "QL Hoá đơn" button → OrderManagementScreen

Route configuration in [RootNavigator.tsx](../../navigation/RootNavigator.tsx):
```typescript
<Stack.Screen
  name="OrderManagement"
  component={OrderManagementScreen}
  options={{
    animation: 'slide_from_right',
  }}
/>
```

## Usage Example

```typescript
import { useOrders, useOrderMutations } from '@/features/order';

// In your component
const { data: ordersResponse, isLoading, refetch } = useOrders(storeId);
const orders = ordersResponse?.data || [];

const { createOrder } = useOrderMutations(storeId);

// Create new order
await createOrder.mutateAsync({
  storeId,
  paymentMethod: 'TRANSFER',
  items: [
    {
      productVariationId: 'uuid',
      quantity: 2,
      unitPrice: 75000,
      totalLineAmount: 150000,
      discountAmount: 0,
      finalLineAmount: 150000
    }
  ],
  totalAmount: 150000,
  finalAmount: 150000
});
```

## Type Definitions

### Order Status
```typescript
type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
```

### Payment Method
```typescript
type PaymentMethod = 'CASH' | 'TRANSFER';
```

### Order Interface
```typescript
interface Order {
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
  items: OrderItem[];
  customer: Customer;
  websocketUrl: string;
  paymentInfo: PaymentInfo;
}
```

## Dependencies

- React Query (@tanstack/react-query) for data fetching
- React Navigation for routing
- React Native Reanimated for animations
- Custom hooks from authentication feature (useStoreData)
- Shared UI components (ScreenHeader, SearchBar, etc.)

## Future Enhancements

- [ ] Order detail screen
- [ ] Order editing/cancellation
- [ ] Refund processing
- [ ] Print receipt functionality
- [ ] Order history export
- [ ] Advanced filtering (date range, amount range)
- [ ] WebSocket integration for real-time payment status updates
