import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '@/shared/components/base/Text';
import Button from '@/shared/components/base/Button';
import { colors, spacing } from '../../../shared/themes';

interface CommissionErrorStateProps {
  onRetry: () => void;
}

const CommissionErrorState: React.FC<CommissionErrorStateProps> = ({ onRetry }) => {
  const { t } = useTranslation('commission');

  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>
        {t('errorLoadingCommissions', 'Unable to load commission history')}
      </Text>
      <Text style={styles.errorMessage}>
        {t('errorMessage', 'Please check your connection and try again')}
      </Text>
      <Button
        label={t('retry', 'Retry')}
        onPress={onRetry}
        style={styles.retryButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  errorTitle: {
    fontSize: 16,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  errorMessage: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    minWidth: 120,
  },
});

export default CommissionErrorState;