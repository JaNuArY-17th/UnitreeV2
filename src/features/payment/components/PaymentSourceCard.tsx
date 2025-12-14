import React from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { colors, FONT_WEIGHTS, getFontFamily, spacing, typography } from '@/shared/themes';
import { Body, Text } from '@/shared/components/base';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Wallet01Icon, CreditCardIcon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { formatVND } from '@/shared/utils/format';
import { usePostpaidData } from '@/features/account/hooks';
import type { EspayStatus } from '@/shared/types';


export interface PaymentSource {
  id: string;
  type: 'main_account' | 'espay_later';
  balance: number;
  accountNumber?: string;
  status?: string;
  bankName?: string;
  isDefault?: boolean;
}

interface PaymentSourceCardProps {
  selectedSource?: PaymentSource;
  onPress: () => void;
}

const PaymentSourceCard: React.FC<PaymentSourceCardProps> = ({
  selectedSource,
  onPress,
}) => {
  const { t } = useTranslation('payment');
  const { t: homeT } = useTranslation('home');

  const { data: postpaidData, isLoading: isPostpaidLoading } = usePostpaidData();

  const espayStatus: EspayStatus = (postpaidData?.success && postpaidData?.data
    ? postpaidData.data.status as EspayStatus
    : 'INACTIVE');

  // Get ESPay status translation
  const getEspayStatusText = (status: EspayStatus): string => {
    switch (status) {
      case 'ACTIVE':
        return homeT('espay.active');
      case 'PENDING':
        return homeT('espay.pending');
      case 'INACTIVE':
        return homeT('espay.inactive');
      case 'LOCKED':
        return homeT('espay.locked');
      default:
        return homeT('espay.inactive');
    }
  };

  const getSourceIcon = (type?: 'main_account' | 'espay_later') => {
    if (type === 'espay_later') {
      return <HugeiconsIcon icon={CreditCardIcon} size={32} color={colors.primary} />;
    }
    return <HugeiconsIcon icon={Wallet01Icon} size={32} color={colors.primary} />;
  };

  const getSourceLabel = (type?: 'main_account' | 'espay_later') => {
    if (type === 'espay_later') {
      return t('paymentSource.espayLater') || 'ESPay Later';
    }
    return t('paymentSource.mainAccount') || 'Main Account';
  };

  const getDisplayInfo = (source: PaymentSource) => {
    if (source.type === 'espay_later') {
      return {
        label: getSourceLabel(source.type),
        detail: getEspayStatusText(espayStatus),
        balance: formatVND(source.balance)
      };
    }
    return {
      label: getSourceLabel(source.type),
      detail: source.accountNumber || '--',
      balance: formatVND(source.balance)
    };
  };

  return (
    <View style={styles.outerContainer}>
      {/* <Text style={styles.label}>{t('paymentSource.payFrom') || 'Pay from'}</Text> */}

      {/* <Pressable
        style={[styles.container, selectedSource && styles.selectedContainer]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={selectedSource ?
          `${t('paymentSource.selectedSource')}: ${getSourceLabel(selectedSource.type)} - ${formatVND(selectedSource.balance)}` :
          t('paymentSource.selectSource')
        }
      > */}
      <View style={styles.content}>
        {selectedSource ? (
          <>
            <View style={styles.sourceInfo}>
              <View style={styles.iconContainer}>
                {getSourceIcon(selectedSource.type)}
              </View>
              <View style={styles.sourceDetails}>
                <View style={styles.sourceHeader}>
                  <Text style={styles.sourceName}>
                    {getDisplayInfo(selectedSource).label} - {getDisplayInfo(selectedSource).detail}
                  </Text>

                </View>
                <Text style={styles.sourceDetail}>
                  {getDisplayInfo(selectedSource).balance}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <Body style={styles.placeholder}>
            {t('paymentSource.selectSource') || 'Select payment source'}
          </Body>
        )}
      </View>

      {/* {selectedSource?.isDefault && (
        <View style={styles.defaultBadge}>
          <Body style={styles.defaultText}>{t('paymentSource.default') || 'Default'}</Body>
        </View>
      )}

      <View style={styles.arrow}>
        <HugeiconsIcon icon={ArrowRight01Icon} size={24} color={colors.text.primary} />
      </View> */}
      {/* </Pressable> */}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    // marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingVertical: spacing.md,
  },
  container: {

  },
  selectedContainer: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '05',
  },
  content: {
    flex: 1,
  },
  label: {
    ...typography.title,
    color: colors.text.primary,
  },
  sourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    width: 38,
    height: 38,
    marginRight: spacing.sm,
    borderRadius: 19,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceDetails: {
    flex: 1,
  },
  sourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // marginBottom: spacing.xs,
  },
  sourceName: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    flex: 1,
  },
  sourceDetail: {
    ...typography.title,
    // color: colors.text.secondary,
  },
  defaultBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  defaultText: {
    ...typography.caption,
    color: colors.light,
  },
  placeholder: {
    ...typography.body,
    color: colors.text.secondary,
  },
  arrow: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    ...typography.title,
    color: colors.text.secondary,
  },
});

export default PaymentSourceCard;
