import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, dimensions, FONT_WEIGHTS, getFontFamily, spacing, typography } from '@/shared/themes';
import { Heading, Body } from '@/shared/components/base';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

type Props = {
  formattedAmount: string;
  errorMessage?: string;
  accountNumber?: string;
  availableBalance?: string;
};

const AmountDisplay: React.FC<Props> = ({ formattedAmount, errorMessage, accountNumber, availableBalance }) => {
  const { t } = useTranslation('withdraw');
  return (
    <View style={styles.container}>
      <Heading level={1} style={styles.amount}>{formattedAmount}</Heading>
      {accountNumber ? (
        <Body style={styles.subtle}>{accountNumber}</Body>
      ) : null}
      {availableBalance ? (
        <Body style={styles.balance}>{t('confirmation.availableBalance')}: {availableBalance}</Body>
      ) : null}
      <View style={styles.errorContainer}>
        {errorMessage ? (
          <Body style={styles.error}>{errorMessage}</Body>
        ) : (
          <Body style={styles.errorPlaceholder}> </Body>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    // paddingTop: spacing.lg,
    // paddingBottom: spacing.sm,
  },
  amount: {
    ...typography.h1,
    fontSize: 34,
    color: colors.primary,
    paddingVertical: spacing.sm,
    textAlign: 'center',
  },
  subtle: {
    marginTop: spacing.xs,
    textAlign: 'center',
    color: colors.gray,
  },
  balance: {
    marginTop: spacing.xs,
    textAlign: 'center',
    color: colors.text.secondary,
  },
  error: {
    marginTop: spacing.xs,
    textAlign: 'center',
    color: colors.danger,
  },
  errorContainer: {
    minHeight: 24,
    // marginTop: spacing.xs,
  },
  errorPlaceholder: {
    ...typography.caption,
    textAlign: 'center',
    color: 'transparent', // Invisible but takes up space
    fontSize: 1, // Minimal font size to ensure consistent spacing
  },
});

export default AmountDisplay;
