# Voucher Components for Order Payment

## Overview

Components để hiển thị và chọn voucher cho đơn thanh toán. Tự động gọi API để kiểm tra voucher khả dụng và tính toán số tiền giảm giá.

## Components

### 1. VoucherListForOrder

Component hiển thị danh sách voucher khả dụng và không khả dụng cho đơn hàng.

**Features:**
- Tự động gọi API `checkVouchersForOrder` để lấy danh sách voucher
- Gọi API `calculateDiscount` khi user chọn voucher
- Cache kết quả discount để tránh gọi API lại
- Hiển thị 2 sections: Available và Unavailable vouchers
- Loading và error states

**Props:**
```typescript
interface VoucherListForOrderProps {
  orderId: string                    // Order ID (UUID)
  orderAmount: number                // Tổng tiền đơn hàng
  onVoucherSelect?: (                // Callback khi user chọn voucher
    voucher: VoucherAvailabilityItem,
    discountInfo: VoucherDiscountCalculateResponse
  ) => void
  selectedVoucherId?: string         // ID của voucher đang được chọn
}
```

**Usage:**
```tsx
import { VoucherListForOrder } from '@/features/voucher/components'

<VoucherListForOrder
  orderId="123e4567-e89b-12d3-a456-426614174000"
  orderAmount={500000}
  onVoucherSelect={(voucher, discountInfo) => {
    console.log('Voucher selected:', voucher.code)
    console.log('Discount amount:', discountInfo.discountAmount)
    console.log('Final amount:', discountInfo.finalAmount)
  }}
  selectedVoucherId={currentVoucherId}
/>
```

### 2. VoucherSelectionModal

Modal component để hiển thị danh sách voucher với header, footer và button apply.

**Features:**
- Full-screen modal với animation
- Header có nút close
- Footer hiển thị summary và button Apply
- Tự động reset state khi close
- Safe area support

**Props:**
```typescript
interface VoucherSelectionModalProps {
  visible: boolean                   // Modal visibility
  onClose: () => void                // Callback khi close modal
  orderId: string                    // Order ID (UUID)
  orderAmount: number                // Tổng tiền đơn hàng
  onVoucherApply: (                 // Callback khi apply voucher
    voucher: VoucherAvailabilityItem,
    discountInfo: VoucherDiscountCalculateResponse
  ) => void
  currentSelectedVoucherId?: string  // ID voucher đang được chọn
}
```

**Usage:**
```tsx
import { VoucherSelectionModal } from '@/features/voucher/components'

const [isModalVisible, setIsModalVisible] = useState(false)

<VoucherSelectionModal
  visible={isModalVisible}
  onClose={() => setIsModalVisible(false)}
  orderId="123e4567-e89b-12d3-a456-426614174000"
  orderAmount={500000}
  onVoucherApply={(voucher, discountInfo) => {
    // Apply voucher to order
    setSelectedVoucher(voucher)
    setDiscountAmount(discountInfo.discountAmount)
    setFinalAmount(discountInfo.finalAmount)
  }}
  currentSelectedVoucherId={selectedVoucherId}
/>
```

## Hooks

### useOrderVouchers

Hook để fetch vouchers khả dụng cho order.

**Usage:**
```typescript
import { useOrderVouchers } from '@/features/voucher/hooks'

const {
  data: vouchersResponse,
  isLoading,
  isError,
  refetch
} = useOrderVouchers(orderId, enabled)
```

## API Flow

### 1. Check Vouchers for Order
```
GET /api/v1/vouchers/check/{orderId}
↓
Response: {
  usableVouchers: [...],
  unusableVouchers: [...]
}
```

### 2. Calculate Discount
```
POST /api/v1/vouchers/calculate-discount
Body: {
  voucherId: "uuid",
  orderId: "uuid",
  originalAmount: 500000
}
↓
Response: {
  voucherId: "uuid",
  orderId: "uuid",
  originalAmount: 500000,
  discountAmount: 100000,
  finalAmount: 400000,
  message: "Applied successfully"
}
```

## Example: Integration in Payment Screen

```tsx
import React, { useState } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Text } from '@/shared/components/base'
import { VoucherSelectionModal } from '@/features/voucher/components'
import type {
  VoucherAvailabilityItem,
  VoucherDiscountCalculateResponse,
} from '@/features/voucher/types'

const PaymentScreen = () => {
  const [orderId] = useState('123e4567-e89b-12d3-a456-426614174000')
  const [orderAmount] = useState(500000)
  const [isVoucherModalVisible, setIsVoucherModalVisible] = useState(false)
  const [selectedVoucher, setSelectedVoucher] =
    useState<VoucherAvailabilityItem | null>(null)
  const [discountInfo, setDiscountInfo] =
    useState<VoucherDiscountCalculateResponse | null>(null)

  const handleVoucherApply = (
    voucher: VoucherAvailabilityItem,
    discount: VoucherDiscountCalculateResponse,
  ) => {
    setSelectedVoucher(voucher)
    setDiscountInfo(discount)
  }

  const finalAmount = discountInfo?.finalAmount || orderAmount

  return (
    <View>
      {/* Order summary */}
      <View>
        <Text>Order Amount: {orderAmount.toLocaleString('vi-VN')} đ</Text>
        {discountInfo && (
          <>
            <Text>Discount: -{discountInfo.discountAmount.toLocaleString('vi-VN')} đ</Text>
            <Text>Final Amount: {finalAmount.toLocaleString('vi-VN')} đ</Text>
          </>
        )}
      </View>

      {/* Voucher selection button */}
      <TouchableOpacity onPress={() => setIsVoucherModalVisible(true)}>
        <Text>
          {selectedVoucher
            ? `Voucher: ${selectedVoucher.code}`
            : 'Select Voucher'}
        </Text>
      </TouchableOpacity>

      {/* Voucher selection modal */}
      <VoucherSelectionModal
        visible={isVoucherModalVisible}
        onClose={() => setIsVoucherModalVisible(false)}
        orderId={orderId}
        orderAmount={orderAmount}
        onVoucherApply={handleVoucherApply}
        currentSelectedVoucherId={selectedVoucher?.id}
      />
    </View>
  )
}
```

## Styling

Components sử dụng theme system từ `@/shared/themes`:
- `colors`: Màu sắc
- `spacing`: Khoảng cách
- `typography`: Typography styles

Có thể override styles bằng cách pass custom styles qua props nếu cần.

## Notes

- **Cache**: Discount results được cache để tránh gọi API lại khi user chọn lại cùng một voucher
- **Error Handling**: Components tự động handle errors và hiển thị error states
- **Loading States**: Loading indicators được hiển thị khi fetching data
- **Safe Area**: Modal support safe area cho iPhone X+
- **Performance**: Sử dụng React.memo và useCallback để optimize performance
