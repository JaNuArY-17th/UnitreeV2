import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, colors } from '@/shared/themes';

const { width } = Dimensions.get('window');

interface RedemptionItem {
  id: string;
  name: string;
  points: number;
  description: string;
  emoji: string;
  category: 'voucher' | 'discount' | 'gift';
}

interface RedemptionHistory {
  id: string;
  item: string;
  points: number;
  date: string;
  status: 'completed' | 'pending';
}

const PointsScreen = () => {
  const insets = useSafeAreaInsets();
  const [currentPoints] = useState(2450);
  const [selectedTab, setSelectedTab] = useState<'catalog' | 'history'>('catalog');

  const redemptionItems: RedemptionItem[] = [
    {
      id: '1',
      name: '$5 Coffee Voucher',
      points: 50,
      description: 'Valid at Starbucks',
      emoji: '☕',
      category: 'voucher',
    },
    {
      id: '2',
      name: 'Free WiFi Day',
      points: 100,
      description: 'Unlimited WiFi for 24 hours',
      emoji: '🌐',
      category: 'discount',
    },
    {
      id: '3',
      name: '$20 Amazon Gift Card',
      points: 200,
      description: 'Digital delivery',
      emoji: '🎁',
      category: 'gift',
    },
    {
      id: '4',
      name: 'Premium Badge',
      points: 150,
      description: 'Exclusive member status',
      emoji: '👑',
      category: 'discount',
    },
    {
      id: '5',
      name: '$10 Uber Eats Credit',
      points: 100,
      description: 'Food delivery credit',
      emoji: '🍔',
      category: 'voucher',
    },
    {
      id: '6',
      name: 'Double Points Day',
      points: 75,
      description: 'Earn 2x points for 24 hours',
      emoji: '⚡',
      category: 'discount',
    },
  ];

  const redemptionHistory: RedemptionHistory[] = [
    {
      id: '1',
      item: '$5 Coffee Voucher',
      points: 50,
      date: 'Dec 18, 2024',
      status: 'completed',
    },
    {
      id: '2',
      item: 'Free WiFi Day',
      points: 100,
      date: 'Dec 15, 2024',
      status: 'completed',
    },
    {
      id: '3',
      item: 'Premium Badge',
      points: 150,
      date: 'Dec 10, 2024',
      status: 'pending',
    },
  ];

  const renderRedemptionCard = ({ item }: { item: RedemptionItem }) => (
    <TouchableOpacity style={styles.redemptionCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.itemEmoji}>{item.emoji}</Text>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemDescription}>{item.description}</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsValue}>{item.points}</Text>
          <Text style={styles.pointsLabel}>pts</Text>
        </View>
        <TouchableOpacity style={styles.redeemButton}>
          <Text style={styles.redeemButtonText}>Redeem</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderHistoryItem = ({ item }: { item: RedemptionHistory }) => (
    <View style={styles.historyCard}>
      <View style={styles.historyContent}>
        <Text style={styles.historyItem}>{item.item}</Text>
        <Text style={styles.historyDate}>{item.date}</Text>
      </View>
      <View
        style={[
          styles.historyStatus,
          {
            backgroundColor:
              item.status === 'completed'
                ? colors.primarySoft
                : colors.warningSoft,
          },
        ]}
      >
        <Text
          style={[
            styles.historyStatusText,
            {
              color:
                item.status === 'completed'
                  ? colors.text.primary
                  : colors.warningDark,
            },
          ]}
        >
          {item.status === 'completed' ? '✓' : '⏳'}{' '}
          {item.status === 'completed' ? 'Completed' : 'Pending'}
        </Text>
      </View>
      <Text style={styles.historyPoints}>-{item.points}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.headerTitle}>Points & Rewards</Text>
      </View>

      {/* Points Balance Card */}
      <View style={styles.pointsCard}>
        <View style={styles.pointsCardContent}>
          <Text style={styles.balanceLabel}>Available Points</Text>
          <Text style={styles.balanceValue}>{currentPoints.toLocaleString()}</Text>
          <Text style={styles.balanceSubtext}>
            Earn more by staying connected to WiFi
          </Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'catalog' && styles.tabActive,
          ]}
          onPress={() => setSelectedTab('catalog')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'catalog' && styles.tabTextActive,
            ]}
          >
            Catalog
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'history' && styles.tabActive,
          ]}
          onPress={() => setSelectedTab('history')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'history' && styles.tabTextActive,
            ]}
          >
            History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
      >
        {selectedTab === 'catalog' ? (
          <View>
            <Text style={styles.sectionTitle}>Available Rewards</Text>
            <FlatList
              data={redemptionItems}
              renderItem={renderRedemptionCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
            />
          </View>
        ) : (
          <View>
            <Text style={styles.sectionTitle}>Redemption History</Text>
            {redemptionHistory.length > 0 ? (
              redemptionHistory.map((item) => (
                <View key={item.id}>
                  {renderHistoryItem({ item })}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateEmoji}>📭</Text>
                <Text style={styles.emptyStateText}>No redemptions yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Start earning points by connecting to WiFi
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
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
  },
  pointsCard: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.lg,
    backgroundColor: colors.secondary,
    borderRadius: 20,
    padding: spacing.lg,
    elevation: 4,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  pointsCardContent: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
    marginBottom: spacing.sm,
    opacity: 0.8,
  },
  balanceValue: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  balanceSubtext: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
    opacity: 0.7,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.primary,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  redemptionCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  itemEmoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  cardTitleContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  itemDescription: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pointsBadge: {
    backgroundColor: colors.primarySoft,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  pointsValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  pointsLabel: {
    fontSize: 10,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  redeemButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  redeemButtonText: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  historyContent: {
    flex: 1,
  },
  historyItem: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  historyDate: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  historyStatus: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
    marginRight: spacing.md,
  },
  historyStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  historyPoints: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.danger,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});

export default PointsScreen;
