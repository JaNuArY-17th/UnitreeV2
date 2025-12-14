import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Text } from '@/shared/components/base';
import { colors, spacing, getFontFamily, FONT_WEIGHTS, typography } from '@/shared/themes';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Mic01Icon,
  Add01Icon,
} from '@hugeicons/core-free-icons';
import {
  CartItemCard,
  CartSummary,
  VoiceInputModal,
  ProductSelectionModal,
} from '../components';
import { VerificationRequiredOverlay, StoreVerificationRequiredOverlay } from '@/shared/components';
import type { CartItem, PaymentMethod } from '../types';
import type { RootStackParamList } from '@/navigation';
import type { Variation } from '@/features/product/types/variation';
import { useOrderMutations } from '@/features/order/hooks';
import { useStoreData } from '@/features/authentication/hooks/useStoreData';
import type { OrderCreateRequest } from '@/features/order/types/order';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Cart'>>();
  const { t } = useTranslation('cart');

  // Get store data
  const { storeData } = useStoreData();
  const storeId = storeData?.id;

  // Order mutations
  const { createOrder } = useOrderMutations();

  // State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [currentDraftOrderId, setCurrentDraftOrderId] = useState<string | null>(null);
  const [isVoiceModalVisible, setIsVoiceModalVisible] = useState(false);
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);

  // Ref to track if we're loading a draft order (prevents creating duplicate drafts)
  const isLoadingDraftRef = useRef(false);

  // Set status bar
  useStatusBarEffect('light', 'dark-content', false);

  // Handle opening voice modal from route params
  useEffect(() => {
    const shouldOpenVoiceModal = route.params?.openVoiceModal;
    const draftOrder = route.params?.draftOrder;
    console.log('[CartScreen] Route params:', route.params);
    console.log('[CartScreen] Should open voice modal:', shouldOpenVoiceModal);
    console.log('[CartScreen] Draft order:', draftOrder);

    // Handle draft order loading - set draft order id FIRST before items
    if (draftOrder && draftOrder.items) {
      console.log('[CartScreen] Loading draft order:', draftOrder.id);
      // Mark that we're loading a draft to prevent the save effect from creating a duplicate
      isLoadingDraftRef.current = true;
      // Set the draft order ID first to prevent creating a new draft
      setCurrentDraftOrderId(draftOrder.id);
      // Then set items and discount
      setCartItems(draftOrder.items);
      setDiscount(draftOrder.discount || 0);
      // Clear the param to prevent reloading on subsequent renders
      navigation.setParams({ draftOrder: undefined });
      // Reset the loading flag after a short delay to allow state updates to propagate
      setTimeout(() => {
        isLoadingDraftRef.current = false;
      }, 100);
    }
    // Note: Don't reset currentDraftOrderId to null here, only when starting a truly new cart

    if (shouldOpenVoiceModal) {
      // Clear the param immediately to prevent reopening on subsequent renders
      navigation.setParams({ openVoiceModal: undefined });

      // iOS needs more time to fully mount the screen and modal infrastructure
      // Multiple animation frames ensure all layout measurements are complete
      const delay = Platform.OS === 'ios' ? 1000 : 600;

      const timer = setTimeout(() => {
        console.log('[CartScreen] Opening voice modal automatically (Platform:', Platform.OS, ')');

        // Use multiple requestAnimationFrame calls for iOS to ensure layout is complete
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsVoiceModalVisible(true);
          });
        });
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [route.params, navigation]);

  // Payment methods (removed selector, default to transfer)
  const paymentMethods: PaymentMethod[] = useMemo(
    () => [
      {
        id: 'cash',
        label: t('payment.cash', 'Trả tiền mặt'),
        icon: 'wallet',
        selected: false, // Always false since we default to transfer
      },
      {
        id: 'transfer',
        label: t('payment.transfer', 'Chuyển khoản'),
        icon: 'card',
        selected: true, // Always true since we default to transfer
      },
    ],
    [t]
  );

  // Round to nearest thousand (Vietnamese currency rounding)
  const roundToNearestThousand = (amount: number): number => {
    return Math.round(amount / 1000) * 1000;
  };

  // Calculate total with rounding for each item
  const total = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const itemTotal = roundToNearestThousand(item.price * item.quantity);
      return sum + itemTotal;
    }, 0);
  }, [cartItems]);

  // Save draft order when cart items change
  useEffect(() => {
    const saveDraftOrder = async () => {
      // Skip saving if we're currently loading a draft order
      if (isLoadingDraftRef.current) {
        console.log('[CartScreen] Skipping save - loading draft order');
        return;
      }

      if (cartItems.length > 0 && storeId) {
        try {
          const draftOrderId = currentDraftOrderId || `draft_${Date.now()}`;
          const draftOrder = {
            id: draftOrderId,
            items: cartItems,
            total: total,
            discount: discount,
            createdAt: new Date().toISOString(),
            storeId: storeId,
          };

          // Get existing draft orders
          const stored = await AsyncStorage.getItem('draft_orders');
          let draftOrders = stored ? JSON.parse(stored) : [];

          // Find existing draft order for this store with the same id
          const existingIndex = draftOrders.findIndex((order: any) =>
            order.storeId === storeId && order.id === draftOrderId
          );

          if (existingIndex >= 0) {
            // Update existing draft order
            draftOrders[existingIndex] = draftOrder;
            console.log('[CartScreen] Draft order updated:', draftOrder.id);
          } else {
            // Add new draft order
            draftOrders.push(draftOrder);
            // Set current draft order id if this is a new draft
            if (!currentDraftOrderId) {
              setCurrentDraftOrderId(draftOrderId);
            }
            console.log('[CartScreen] Draft order saved:', draftOrder.id);
          }

          // Keep only last 10 drafts per store
          const storeDrafts = draftOrders.filter((order: any) => order.storeId === storeId);
          if (storeDrafts.length > 10) {
            // Remove oldest drafts for this store
            const draftsToRemove = storeDrafts.slice(0, storeDrafts.length - 10);
            draftOrders = draftOrders.filter((order: any) =>
              !(order.storeId === storeId && draftsToRemove.some((remove: any) => remove.id === order.id))
            );
          }

          await AsyncStorage.setItem('draft_orders', JSON.stringify(draftOrders));
        } catch (error) {
          console.error('[CartScreen] Error saving draft order:', error);
        }
      }
    };

    // Debounce saving to avoid too many writes
    const timeoutId = setTimeout(saveDraftOrder, 1000);
    return () => clearTimeout(timeoutId);
  }, [cartItems, total, discount, storeId, currentDraftOrderId]);

  // Clear current draft order when checkout is successful (cart is cleared)
  useEffect(() => {
    // Skip if we're loading a draft order
    if (isLoadingDraftRef.current) {
      return;
    }

    if (cartItems.length === 0 && currentDraftOrderId) {
      const clearCurrentDraftOrder = async () => {
        try {
          const stored = await AsyncStorage.getItem('draft_orders');
          if (stored) {
            let draftOrders = JSON.parse(stored);
            draftOrders = draftOrders.filter((order: any) => order.id !== currentDraftOrderId);
            await AsyncStorage.setItem('draft_orders', JSON.stringify(draftOrders));
            console.log('[CartScreen] Current draft order cleared:', currentDraftOrderId);
            setCurrentDraftOrderId(null);
          }
        } catch (error) {
          console.error('[CartScreen] Error clearing current draft order:', error);
        }
      };
      clearCurrentDraftOrder();
    }
  }, [cartItems.length, currentDraftOrderId]);

  // Handlers
  const handleQuantityChange = (id: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handlePriceEdit = (id: string, price: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, price } : item))
    );
  };

  const handleDelete = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleDiscountChange = (amount: number) => {
    setDiscount(amount);
  };

  const handleCheckout = async () => {
    if (!storeId) {
      console.error('❌ [CartScreen] No store ID available');
      return;
    }

    if (cartItems.length === 0) {
      console.error('❌ [CartScreen] Cart is empty');
      return;
    }

    const finalAmount = total - discount;

    console.log('🛒 [CartScreen] Checkout clicked:', {
      items: cartItems,
      total,
      discount,
      paymentMethod: 'transfer',
      finalAmount,
    });

    try {
      // Separate voice items and regular items
      const regularItems = cartItems.filter((item) => !item.isVoiceItem);
      const voiceItems = cartItems.filter((item) => item.isVoiceItem);

      // Create order request with separated items (with rounded amounts)
      const orderRequest: OrderCreateRequest = {
        storeId: storeId,
        paymentMethod: 'TRANSFER',
        items: regularItems.map((item) => {
          const roundedTotal = roundToNearestThousand(item.price * item.quantity);
          return {
            productVariationId: item.id,
            quantity: item.quantity,
            unitPrice: item.price,
            totalLineAmount: roundedTotal,
            discountAmount: 0,
            finalLineAmount: roundedTotal,
          };
        }),
        itemsVoice: voiceItems.length > 0 ? voiceItems.map((item) => {
          const roundedTotal = roundToNearestThousand(item.price * item.quantity);
          return {
            itemName: item.name,
            unit: item.unit || '',
            quantity: item.quantity,
            unitPrice: item.price,
            totalLineAmount: roundedTotal,
            discountAmount: 0,
            finalLineAmount: roundedTotal,
          };
        }) : undefined,
        totalAmount: total,
        discountAmount: discount,
        finalAmount: finalAmount,
      };

      console.log('📦 [CartScreen] Creating order:', orderRequest);
      console.log('📦 [CartScreen] Regular items:', regularItems.length);
      console.log('📦 [CartScreen] Voice items:', voiceItems.length);

      // Call API to create order
      const result = await createOrder.mutateAsync(orderRequest);

      console.log('✅ [CartScreen] Order created successfully:', result);

      // Navigate to payment confirmation screen with order data
      console.log('🚀 [CartScreen] Navigating to CartPaymentConfirm with order data...');
      navigation.navigate('CartPaymentConfirm', {
        cartItems: cartItems,
        totalAmount: finalAmount,
        discount: discount,
        paymentMethod: 'transfer',
        orderData: result.data, // Pass order data with payment info
      });
    } catch (error) {
      console.error('❌ [CartScreen] Failed to create order:', error);
      // Show error to user
    }
  };

  const handleVoiceInputPress = () => {
    setIsVoiceModalVisible(true);
  };

  const handleProductSelectionPress = () => {
    setIsProductModalVisible(true);
  };

  const handleVoiceModalClose = () => {
    setIsVoiceModalVisible(false);
  };

  const handleProductModalClose = () => {
    setIsProductModalVisible(false);
  };

  const handleProductAdded = (product: Omit<CartItem, 'id'>) => {
    const newItem: CartItem = {
      ...product,
      id: Date.now().toString(), // Generate unique ID
    };
    setCartItems((prev) => [...prev, newItem]);
    console.log('✅ [Cart] Product added via voice:', newItem);
  };

  const handleProductSelected = (variation: Variation) => {
    const newItem: CartItem = {
      id: variation.id,
      name: variation.name,
      price: variation.sale_price || variation.price || 0,
      quantity: 1,
      unit: variation.unit,
      abbreviation: variation.sku.substring(0, 2).toUpperCase(),
    };
    setCartItems((prev) => {
      // Check if item already exists
      const existingIndex = prev.findIndex((item) => item.id === newItem.id);
      if (existingIndex >= 0) {
        // Increase quantity
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }
      // Add new item
      return [...prev, newItem];
    });
    console.log('✅ [Cart] Product selected:', newItem);
  };

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <VerificationRequiredOverlay>
        <StoreVerificationRequiredOverlay>
          <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScreenHeader title={t('title', 'Giỏ hàng')} showBack={true} />
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('emptyCart', 'Giỏ hàng trống')}</Text>
              <Text style={styles.emptySubtext}>
                {t('emptyDescription', 'Thêm sản phẩm để tạo đơn hàng')}
              </Text>
            </View>

            {/* Action Buttons - Empty State */}
            <View style={styles.fabContainer}>
              {storeData?.businessType !== 'COMPANY' && (
                <Pressable
                  style={({ pressed }) => [
                    styles.fabButton,
                    styles.fabVoice,
                    pressed && styles.fabPressed,
                  ]}
                  onPress={handleVoiceInputPress}
                  accessibilityRole="button"
                  accessibilityLabel={t('voiceInput', 'Nói để thêm sản phẩm')}
                >
                  <HugeiconsIcon icon={Mic01Icon} size={28} color={colors.light} />
                </Pressable>
              )}

              <Pressable
                style={({ pressed }) => [
                  styles.fabButton,
                  styles.fabAdd,
                  pressed && styles.fabPressed,
                ]}
                onPress={handleProductSelectionPress}
                accessibilityRole="button"
                accessibilityLabel={t('searchProduct', 'Tìm thêm sản phẩm')}
              >
                <HugeiconsIcon icon={Add01Icon} size={24} color={colors.light} />
              </Pressable>
            </View>

            {/* Fixed Bottom Summary - Empty State */}
            <CartSummary
              total={total}
              discount={discount}
              onDiscountChange={handleDiscountChange}
              onCheckout={handleCheckout}
              isCheckingOut={createOrder.isPending}
            />

            {/* Product Selection Modal */}
            <ProductSelectionModal
              visible={isProductModalVisible}
              onClose={handleProductModalClose}
              onSelectProduct={handleProductSelected}
            />

            {/* Voice Input Modal */}
            <VoiceInputModal
              visible={isVoiceModalVisible}
              onClose={handleVoiceModalClose}
              onProductAdded={handleProductAdded}
            />
          </View>
        </StoreVerificationRequiredOverlay>
      </VerificationRequiredOverlay>
    );
  }

  return (
    <VerificationRequiredOverlay>
      <StoreVerificationRequiredOverlay>
        <View style={[styles.container, { paddingTop: insets.top }]}>
          {/* Header */}
          <ScreenHeader title={t('title', 'Giỏ hàng')} showBack={true} />

          {/* Cart Items List */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + 16 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Cart Items */}
            <View style={styles.itemsContainer}>
              {cartItems.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onPriceEdit={handlePriceEdit}
                  onDelete={handleDelete}
                />
              ))}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.fabContainer}>
            {storeData?.businessType !== 'COMPANY' && (
              <Pressable
                style={({ pressed }) => [
                  styles.fabButton,
                  styles.fabVoice,
                  pressed && styles.fabPressed,
                ]}
                onPress={handleVoiceInputPress}
                accessibilityRole="button"
                accessibilityLabel={t('voiceInput', 'Nói để thêm sản phẩm')}
              >
                <HugeiconsIcon icon={Mic01Icon} size={28} color={colors.light} />
              </Pressable>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.fabButton,
                styles.fabAdd,
                pressed && styles.fabPressed,
              ]}
              onPress={handleProductSelectionPress}
              accessibilityRole="button"
              accessibilityLabel={t('searchProduct', 'Tìm thêm sản phẩm')}
            >
              <HugeiconsIcon icon={Add01Icon} size={24} color={colors.light} />
            </Pressable>
          </View>

          {/* Fixed Bottom Summary */}
          <CartSummary
            total={total}
            discount={discount}
            onDiscountChange={handleDiscountChange}
            onCheckout={handleCheckout}
            isCheckingOut={createOrder.isPending}
          />

          {/* Product Selection Modal */}
          <ProductSelectionModal
            visible={isProductModalVisible}
            onClose={handleProductModalClose}
            onSelectProduct={handleProductSelected}
          />

          {/* Voice Input Modal */}
          <VoiceInputModal
            visible={isVoiceModalVisible}
            onClose={handleVoiceModalClose}
            onProductAdded={handleProductAdded}
          />
        </View>
      </StoreVerificationRequiredOverlay>
    </VerificationRequiredOverlay>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    // paddingTop: spacing.md,
  },
  itemsContainer: {
    marginBottom: spacing.md,
  },
  fabContainer: {
    position: 'absolute',
    right: spacing.lg,
    bottom: 160, // Positioned above CartSummary (approximate height: 260px + padding)
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    gap: spacing.md,
    zIndex: 10,
  },
  fabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabVoice: {
    backgroundColor: colors.primary,
  },
  fabAdd: {
    backgroundColor: colors.success,
  },
  fabPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    ...typography.h3,
    // color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: 15,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default CartScreen;
