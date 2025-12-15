import { View, StyleSheet } from 'react-native';
import Text from '@/shared/components/base/Text';
import { colors, spacing } from '@/shared/themes';
import { useTranslation } from 'react-i18next';

const RecentPaymentsList = () => {
  const { t } = useTranslation('home');

  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>
        {t('transactions_feature_unavailable') || 'Recent transactions feature is not available'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  placeholder: {
    textAlign: 'center',
    color: colors.text.secondary,
  },
});

export default RecentPaymentsList;
