import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Animated, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, getFontFamily, FONT_WEIGHTS, typography, getPlatformFontExtras } from '@/shared/themes';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { Text as T } from '@/shared/components/base';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { formatVND } from '@/shared/utils/format';
import { useTransactionHistory } from '../hooks';

// Map API transaction type/state to local display type
const mapTxnType = (state: string): 'deposit' | 'withdraw' => {
  if (state === 'MONEY_IN') return 'deposit';
  if (state === 'MONEY_OUT') return 'withdraw';
  return 'withdraw';
};

interface UiTxn {
  id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  status: 'processing' | 'success' | 'failed';
  createdAt: string;
  transactionId: string;
  bankName: string;
  bankNumberMasked: string;
  holderName: string;
}

interface FundTxn {
  id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  fee: number;
  netAmount: number;
  bankName: string;
  bankNumberMasked: string;
  holderName: string;
  status: 'processing' | 'success' | 'failed';
  createdAt: string; // ISO
  transactionId: string;
  transferContent?: string;
}

const WithdrawHistoryScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('withdraw');
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [data, setData] = useState<UiTxn[]>([]);

  const [typeFilter, setTypeFilter] = useState<'all' | 'deposit' | 'withdraw'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7d' | '30d'>('all');

  // Client-side filter only for search; type/date trigger separate API requests (spec requirement)
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return data;
    return data.filter(d => (
      d.bankName.toLowerCase().includes(q) ||
      d.bankNumberMasked.toLowerCase().includes(q) ||
      d.transactionId.toLowerCase().includes(q)
    ));
  }, [data, searchQuery]);

  const history = useTransactionHistory({
    // bankType omitted to use current bank type from manager
    typeFilter,
    dateFilter,
    pageSize: 20,
    debounceMs: 300,
  });

  // Sync local data with hook output for search filtering
  useEffect(() => {
    setData(history.data);
    if (!history.loadingInitial) {
      setInitialLoading(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    }
  }, [history.data, history.loadingInitial, fadeAnim]);

  const onEndReached = () => {
    history.loadMore();
  };

  const onRefresh = () => {
    setRefreshing(true);
    history.refresh();
    setTimeout(() => setRefreshing(false), 500);
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleString('vi-VN', {
    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
  });

  const statusColor = (s: FundTxn['status']) => {
    switch (s) {
      case 'success': return colors.success;
      case 'failed': return colors.danger;
      default: return colors.warning;
    }
  };

  const navigation = require('@react-navigation/native').useNavigation();

  const renderItem = ({ item }: { item: UiTxn }) => (
    <Pressable style={styles.card} onPress={() => navigation.navigate('WithdrawTransactionDetail', { transaction: item })}>
      <View style={styles.cardRowTop}>
        <T style={styles.amount}>{formatVND(item.amount)}</T>
        <T style={[styles.typeBadge, item.type === 'deposit' ? styles.depositBadge : styles.withdrawBadge]}>{t(`history.typeValues.${item.type}`, item.type)}</T>
      </View>
      <View style={styles.midRow}>
        <T variant="caption" style={styles.bank}>{item.bankName}</T>
        <T variant="caption" style={[styles.status, { color: statusColor(item.status) }]}>{t(`status.${item.status}`, item.status)}</T>
      </View>
      <View style={styles.footerRow}>
        <T variant="caption" style={styles.date}>{formatDate(item.createdAt)}</T>
        <T variant="caption" style={styles.txnId}>{item.transactionId}</T>
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title={t('history.title', 'Withdrawal History')} />
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('history.searchPlaceholder', 'Search by bank or ID')}
          placeholderTextColor={colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <View style={styles.filtersRow}>
        <View style={styles.filterList}>

          {(['all', 'deposit', 'withdraw'] as const).map(ft => (
            <Pressable key={ft} style={[styles.filterPill, typeFilter === ft && styles.filterPillActive]} onPress={() => setTypeFilter(ft)}>
              <T variant="caption" style={[styles.filterPillText, typeFilter === ft && styles.filterPillTextActive]}>{t(`history.typeFilters.${ft}`, ft)}</T>
            </Pressable>
          ))}
        </View>
        <View style={styles.filterList}>
          {(['all', 'today', '7d', '30d'] as const).map(df => (
            <Pressable key={df} style={[styles.filterPill, dateFilter === df && styles.filterPillActive]} onPress={() => setDateFilter(df)}>
              <T variant="caption" style={[styles.filterPillText, dateFilter === df && styles.filterPillTextActive]}>{t(`history.dateFilters.${df}`, df)}</T>
            </Pressable>
          ))}
        </View>
      </View>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {initialLoading && data.length === 0 ? (
          <View style={[styles.emptyContainer, { justifyContent: 'center', flex: 1 }]}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(i) => i.id}
            renderItem={renderItem}
            contentContainerStyle={[styles.listContent, filtered.length === 0 && styles.emptyList]}
            ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <T style={styles.emptyText}>{t('history.empty', 'No records')}</T>
                <T variant="caption" style={styles.emptySub}>{t('history.emptyHelper', 'Your records will appear here.')}</T>
              </View>
            }
            onEndReachedThreshold={0.3}
            onEndReached={onEndReached}
            ListFooterComponent={history.loadingMore ? (
              <View style={{ paddingVertical: spacing.md }}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : null}
            showsVerticalScrollIndicator={false}
          />
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchWrap: { paddingHorizontal: spacing.lg, marginTop: spacing.md },
  searchInput: { backgroundColor: '#F9FAFB', borderRadius: 12, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, ...typography.bodySmall, color: colors.text.primary, borderWidth: 1, borderColor: '#E5E7EB' },
  listContent: { padding: spacing.lg },
  emptyList: { flexGrow: 1, justifyContent: 'center' },
  card: { backgroundColor: colors.light, borderRadius: 16, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  cardRowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  amount: { ...typography.subtitle, color: colors.text.primary },
  status: { ...typography.timestamp, fontWeight: '600', textTransform: 'capitalize' },
  typeBadge: { ...typography.timestamp, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, overflow: 'hidden', color: colors.light },
  depositBadge: { backgroundColor: colors.success },
  withdrawBadge: { backgroundColor: colors.primary },
  midRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  bank: { color: colors.text.secondary },
  txnId: { color: colors.text.secondary },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  label: { color: colors.text.secondary, flex: 1 },
  value: { color: colors.text.primary, flex: 1, textAlign: 'right' },
  net: { color: colors.success },
  footerRow: { marginTop: spacing.sm, flexDirection: 'row', justifyContent: 'space-between' },
  date: { color: colors.text.secondary },
  emptyContainer: { alignItems: 'center', padding: spacing.xl },
  emptyText: { ...typography.body, fontWeight: '500', color: colors.text.secondary, marginBottom: spacing.xs },
  emptySub: { color: colors.text.secondary, opacity: 0.7 },
  filtersRow: { flexDirection: 'column', flexWrap: 'wrap', gap: 8, paddingHorizontal: spacing.lg, marginTop: spacing.sm },
  filterList: { flexDirection: 'row' },
  filterPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14, backgroundColor: colors.light, borderWidth: 1, borderColor: colors.border, marginRight: 8, marginTop: 8 },
  filterPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterPillText: { color: colors.text.secondary },
  filterPillTextActive: { color: colors.light, ...getPlatformFontExtras(FONT_WEIGHTS.SEMIBOLD) },
});

export default WithdrawHistoryScreen;
