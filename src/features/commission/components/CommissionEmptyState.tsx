import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '@/shared/components/base/Text';
import { colors, spacing } from '../../../shared/themes';

const CommissionEmptyState: React.FC = () => {
  const { t } = useTranslation('commission');

  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>
        {t('noCommissions', 'No commission history')}
      </Text>
      <Text style={styles.emptyMessage}>
        {t('noCommissionsMessage', 'You don\'t have any commission transactions yet')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    fontSize: 16,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default CommissionEmptyState;