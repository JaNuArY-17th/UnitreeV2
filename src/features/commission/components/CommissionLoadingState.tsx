import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '@/shared/components/base/Text';
import { colors, spacing } from '../../../shared/themes';

const CommissionLoadingState: React.FC = () => {
  const { t } = useTranslation('commission');

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>
        {t('loadingCommissions', 'Loading commission history...')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default CommissionLoadingState;