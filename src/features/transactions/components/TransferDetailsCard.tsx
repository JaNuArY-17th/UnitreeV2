import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from '@/shared/components/base/Text';
import { useTranslation } from 'react-i18next';
import { colors, dimensions, spacing, getFontFamily, FONT_WEIGHTS, typography } from '@/shared/themes';
import { formatVND } from '@/shared/utils/format';

interface TransferDetails {
  transferId: string;
  transferAmount: string;
  description: string;
  transactionTime?: string;
  transactionType: string;
  state: string;
}

interface TransferDetailsCardProps {
  transferDetails: TransferDetails;
}

const TransferDetailsCard: React.FC<TransferDetailsCardProps> = ({
  transferDetails,
}) => {
  const { t } = useTranslation('transactions');

  const formatTransactionTime = (dateTimeStr?: string) => {
    if (!dateTimeStr) return '';

    // Handle format with newline (date\ntime)
    if (dateTimeStr.includes('\n')) {
      const [date, time] = dateTimeStr.split('\n');
      return `${date} ${time}`;
    }

    // Handle ISO format (YYYY-MM-DDTHH:mm:ss.sss)
    if (dateTimeStr.includes('T')) {
      const [date, timeRaw] = dateTimeStr.split('T');
      const time = timeRaw ? timeRaw.split('.')[0] : '';
      return `${date} ${time}`;
    }

    return dateTimeStr;
  };

  const details = [
    { label: t('transactionDetail.transferId'), value: transferDetails.transferId },
    { label: t('transactionDetail.transferAmount'), value: transferDetails.transferAmount },
    ...(transferDetails.state === 'MONEY_OUT' ? [
      { label: t('transactionDetail.source'), value: transferDetails.transactionType === 'REAL' ? t('transactionDetail.mainAccount') : transferDetails.transactionType === 'CREDIT' ? t('transactionDetail.esPayLater') : '' }
    ] : []),
    ...(transferDetails.transactionTime ? [
      { label: t('transactionDetail.transactionTime'), value: formatTransactionTime(transferDetails.transactionTime) }
    ] : []),
    { label: t('transactionDetail.description'), value: transferDetails.description, isDescription: true },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('transactionDetail.transferDetails')}</Text>

      {details.map((detail, index) => (
        <React.Fragment key={detail.label}>
          <View style={[
            styles.detailRow,
            detail.isDescription && styles.descriptionRow
          ]}>
            <Text style={styles.detailLabel}>{detail.label}</Text>
            <Text style={[
              styles.detailValue,
              detail.isDescription && styles.descriptionValue
            ]}>
              {detail.value}
            </Text>
          </View>
          {index < details.length - 1 && (
            <View style={styles.dashSeparator} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: dimensions.radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
  },
  title: {
    ...typography.title,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  descriptionRow: {
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  detailValue: {
    ...typography.subtitle,
    color: colors.text.primary,
  },
  descriptionValue: {
    ...typography.subtitle,
    color: colors.text.primary,
    textAlign: 'right',
    flex: 1,
    marginLeft: spacing.lg,
  },
  totalAmountValue: {
    //
  },
  dashSeparator: {
    height: 1,
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 0,
  },
});

export default TransferDetailsCard;
