import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, colors } from '@/shared/themes';

const { width } = Dimensions.get('window');

interface Item {
  id: string;
  name: string;
  points: number;
  image: string;
  category: string;
  rating: number;
  inStock: boolean;
  description: string;
}

const RedeemScreen = () => {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPoints] = useState(2450);

  const categories = [
    { id: 'all', label: 'All Items', emoji: '⭐' },
    { id: 'food', label: 'Food & Drink', emoji: '🍔' },
    { id: 'electronics', label: 'Electronics', emoji: '💻' },
    { id: 'entertainment', label: 'Entertainment', emoji: '🎮' },
    { id: 'lifestyle', label: 'Lifestyle', emoji: '👕' },
  ];

  const items: Item[] = [
    {
      id: '1',
      name: '$5 Coffee Voucher',
      points: 50,
      image: '☕',
      category: 'food',
      rating: 4.8,
      inStock: true,
      description: 'Valid at any Starbucks location for any beverage up to $5',
    },
    {
      id: '2',
      name: '$20 Amazon Gift Card',
      points: 200,
      image: '🎁',
      category: 'electronics',
      rating: 4.9,
      inStock: true,
      description: 'Digital gift card delivered instantly to your email',
    },
    {
      id: '3',
      name: 'PlayStation Store $25',
      points: 250,
      image: '🎮',
      category: 'entertainment',
      rating: 4.7,
      inStock: true,
      description: 'Use for any games or in-game purchases',
    },
    {
      id: '4',
      name: '$15 Uber Eats Credit',
      points: 120,
      image: '🍕',
      category: 'food',
      rating: 4.6,
      inStock: true,
      description: 'Food delivery credit valid for 30 days',
    },
    {
      id: '5',
      name: 'Netflix Premium Month',
      points: 300,
      image: '🎬',
      category: 'entertainment',
      rating: 4.8,
      inStock: false,
      description: '1 month of Netflix Premium streaming',
    },
    {
      id: '6',
      name: 'Wireless Earbuds',
      points: 450,
      image: '🎧',
      category: 'electronics',
      rating: 4.5,
      inStock: true,
      description: 'Premium wireless earbuds with noise cancellation',
    },
    {
      id: '7',
      name: '$10 Nike Gift Card',
      points: 100,
      image: '👟',
      category: 'lifestyle',
      rating: 4.7,
      inStock: true,
      description: 'Shop athletic wear and sneakers',
    },
    {
      id: '8',
      name: '30-Day Premium Pass',
      points: 350,
      image: '👑',
      category: 'lifestyle',
      rating: 4.9,
      inStock: true,
      description: 'Unlock exclusive WiFi speeds and priority access',
    },
  ];

  const filteredItems = items.filter(
    (item) => selectedCategory === 'all' || item.category === selectedCategory
  );

  const handleRedeemPress = (item: Item) => {
    if (item.inStock && currentPoints >= item.points) {
      setSelectedItem(item);
      setShowModal(true);
    } else if (!item.inStock) {
      Alert.alert('Out of Stock', 'This item is currently unavailable');
    } else {
      Alert.alert(
        'Insufficient Points',
        `You need ${item.points - currentPoints} more points`
      );
    }
  };

  const handleConfirmRedeem = () => {
    Alert.alert(
      'Redemption Successful!',
      `You've redeemed ${selectedItem?.name}. Check your email for details.`,
      [
        {
          text: 'OK',
          onPress: () => {
            setShowModal(false);
            setSelectedItem(null);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View>
          <Text style={styles.headerTitle}>Redeem Items</Text>
          <Text style={styles.pointsAvailable}>
            You have {currentPoints.toLocaleString()} points
          </Text>
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={styles.categoryEmoji}>{category.emoji}</Text>
            <Text
              style={[
                styles.categoryLabel,
                selectedCategory === category.id &&
                  styles.categoryLabelActive,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Items Grid */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
      >
        <View style={styles.itemsGrid}>
          {filteredItems.map((item) => (
            <View
              key={item.id}
              style={[
                styles.itemCard,
                !item.inStock && styles.itemCardDisabled,
              ]}
            >
              {!item.inStock && (
                <View style={styles.outOfStockBadge}>
                  <Text style={styles.outOfStockText}>Out of Stock</Text>
                </View>
              )}

              <View style={styles.itemImage}>
                <Text style={styles.itemImageText}>{item.image}</Text>
              </View>

              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </Text>

                <View style={styles.ratingContainer}>
                  <Text style={styles.rating}>★ {item.rating}</Text>
                </View>

                <View style={styles.itemFooter}>
                  <View style={styles.pointsDisplay}>
                    <Text style={styles.pointsLabel}>{item.points}</Text>
                    <Text style={styles.pointsUnit}>pts</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.redeemBtn,
                      !item.inStock && styles.redeemBtnDisabled,
                    ]}
                    onPress={() => handleRedeemPress(item)}
                    disabled={!item.inStock}
                  >
                    <Text
                      style={[
                        styles.redeemBtnText,
                        !item.inStock && styles.redeemBtnTextDisabled,
                      ]}
                    >
                      Redeem
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            {/* Modal Body */}
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
            >
              {selectedItem && (
                <>
                  {/* Item Display */}
                  <View style={styles.modalItemDisplay}>
                    <Text style={styles.modalItemImage}>
                      {selectedItem.image}
                    </Text>
                  </View>

                  {/* Item Details */}
                  <View style={styles.modalItemDetails}>
                    <Text style={styles.modalItemName}>{selectedItem.name}</Text>

                    <View style={styles.modalRatingContainer}>
                      <Text style={styles.modalRating}>
                        ★ {selectedItem.rating}
                      </Text>
                    </View>

                    <Text style={styles.modalDescription}>
                      {selectedItem.description}
                    </Text>

                    {/* Points Info */}
                    <View style={styles.pointsInfoCard}>
                      <Text style={styles.pointsInfoLabel}>Points Required</Text>
                      <View style={styles.pointsInfoRow}>
                        <Text style={styles.pointsInfoValue}>
                          {selectedItem.points}
                        </Text>
                        <Text style={styles.pointsInfoAvailable}>
                          (You have: {currentPoints})
                        </Text>
                      </View>
                    </View>

                    {/* Redeem Button */}
                    <TouchableOpacity
                      style={styles.modalRedeemButton}
                      onPress={handleConfirmRedeem}
                    >
                      <Text style={styles.modalRedeemButtonText}>
                        Confirm Redemption
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.modalCancelButton}
                      onPress={() => setShowModal(false)}
                    >
                      <Text style={styles.modalCancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  pointsAvailable: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  categoriesScroll: {
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoriesContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.background,
    marginRight: spacing.sm,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  categoryLabelActive: {
    color: colors.text.primary,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  itemCard: {
    width: (width - spacing.md * 2 - spacing.md) / 2,
    backgroundColor: colors.background,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemCardDisabled: {
    opacity: 0.5,
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.danger,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
    zIndex: 10,
  },
  outOfStockText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.light,
  },
  itemImage: {
    aspectRatio: 1,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImageText: {
    fontSize: 64,
  },
  itemInfo: {
    padding: spacing.md,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
    height: 32,
  },
  ratingContainer: {
    marginBottom: spacing.sm,
  },
  rating: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsDisplay: {
    backgroundColor: colors.primarySoft,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
  },
  pointsLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  pointsUnit: {
    fontSize: 9,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  redeemBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 6,
  },
  redeemBtnDisabled: {
    backgroundColor: colors.lightGray,
  },
  redeemBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.primary,
  },
  redeemBtnTextDisabled: {
    color: colors.text.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.light,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '80%',
    paddingTop: spacing.md,
  },
  closeButton: {
    alignSelf: 'center',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.text.primary,
    fontWeight: '700',
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  modalItemDisplay: {
    height: 200,
    backgroundColor: colors.secondarySoft,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalItemImage: {
    fontSize: 100,
  },
  modalItemDetails: {
    marginBottom: spacing.lg,
  },
  modalItemName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  modalRatingContainer: {
    marginBottom: spacing.md,
  },
  modalRating: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  modalDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  pointsInfoCard: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  pointsInfoLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  pointsInfoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  pointsInfoValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    marginRight: spacing.sm,
  },
  pointsInfoAvailable: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  modalRedeemButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalRedeemButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  modalCancelButton: {
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
  },
});

export default RedeemScreen;
