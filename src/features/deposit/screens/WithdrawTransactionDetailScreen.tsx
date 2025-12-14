import React, { useMemo } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { Text as T, Button } from '@/shared/components/base';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation';
import { formatVND } from '@/shared/utils/format';
import { useTransactionDetail } from '@/features/transactions/hooks';
import { useTranslation } from '@/shared/hooks/useTranslation';

const Row: React.FC<{ label: string; value?: string | number; highlighted?: boolean }>= ({ label, value, highlighted }) => (
  <View style={[styles.row, highlighted && styles.rowHighlighted]}>
    <T variant="body" style={[styles.label, highlighted && styles.labelHighlighted]}>{label}</T>
    <T variant="body" style={[styles.value, highlighted && styles.valueHighlighted]}>{value}</T>
  </View>
);

type DetailRoute = RouteProp<RootStackParamList, 'WithdrawTransactionDetail'>;

const WithdrawTransactionDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('withdraw');
  const route = useRoute<DetailRoute>();
  const navigation = useNavigation();
  // Support legacy param (transaction object) or new param (transactionId)
  const legacy = (route.params as any)?.transaction;
  const transactionId = (route.params as any)?.transactionId || legacy?.id;

  const { data, isLoading, isError } = useTransactionDetail(
    legacy ? undefined : transactionId // if legacy provided, skip fetch
  );

  const txn = useMemo(() => {
    if (legacy) return legacy;
    if (!data?.data) return undefined;
    const api = data.data; // Transaction from API
    return {
      id: String(api.id),
      type: api.state === 'MONEY_IN' ? 'deposit' : 'withdraw',
      amount: Number(api.amount),
      fee: 0, // API does not yet return fee
      netAmount: Number(api.amount),
      bankName: '',
      bankNumberMasked: '',
      holderName: '',
      status: 'success' as const,
      createdAt: api.createdAt,
      transactionId: api.transactionCode,
      transferContent: api.description,
    };
  }, [legacy, data]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title={t('history.detailTitle', 'Transaction Detail')} onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading && !txn && (
          <View style={[styles.card,{alignItems:'center',justifyContent:'center'}]}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}
        {isError && !txn && (
          <View style={styles.card}>
            <T variant="body" style={{ color: colors.danger }}>{t('history.detailError','Unable to load transaction')}</T>
          </View>
        )}
        {txn && (
          <View style={styles.card}>
            <Row label={t('result.transactionId')} value={txn.transactionId} />
            <Row label={t('history.type', 'Type')} value={String(t(`history.typeValues.${txn.type}`, txn.type))} />
            <Row label={t('result.amountRequested')} value={formatVND(txn.amount)} />
            <Row label={t('result.fee')} value={`- ${formatVND(txn.fee)}`} />
            <Row label={t('result.netAmount')} value={formatVND(txn.netAmount)} highlighted />
            <Row label={t('confirmation.bank')} value={txn.bankName} />
            <Row label={t('confirmation.accountNumber')} value={txn.bankNumberMasked} />
            <Row label={t('confirmation.accountHolder')} value={txn.holderName} />
            {txn.transferContent && <Row label={t('history.transferContent', 'Content')} value={txn.transferContent} />}
            <Row label={t('result.processedAt')} value={new Date(txn.createdAt).toLocaleString('vi-VN')} />
            <Row label={t('history.detailStatus', 'Status')} value={String(t(`status.${txn.status}`, txn.status))} />
          </View>
        )}
        <Button label={t('history.back', 'Back')} variant="primary" size="lg" fullWidth onPress={() => navigation.goBack()} style={styles.backButton} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  card: { backgroundColor: colors.light, borderRadius: 16, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.mutedLine },
  rowHighlighted: { backgroundColor: colors.successSoft, marginHorizontal: -spacing.lg, paddingHorizontal: spacing.lg },
  label: { color: colors.text.secondary, flex: 1, marginRight: spacing.md },
  value: { color: colors.text.primary, flex: 1, textAlign: 'right' },
  labelHighlighted: { color: colors.success },
  valueHighlighted: { color: colors.success, fontFamily: getFontFamily(FONT_WEIGHTS.BOLD) },
  backButton: { marginTop: spacing.xl },
});

export default WithdrawTransactionDetailScreen;
