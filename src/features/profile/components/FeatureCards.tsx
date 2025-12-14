import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from '@/shared/components/base/Text';
import { QRScan, Shield } from '@/shared/assets/icons';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, spacing, dimensions, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';

export const FeatureCards: React.FC = () => {
  const { t } = useTranslation('profile');

  const handleQRManagement = () => {
    // Navigate to QR management screen
    console.log('QR Management pressed');
  };

  const handleZalopayPriority = () => {
    // Navigate to Zalopay Priority screen
    console.log('Zalopay Priority pressed');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.card} onPress={handleQRManagement}>
        <QRScan width={24} height={24} color={colors.primary} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>
            {t('features.qrManagement.title')}
          </Text>
          <Text style={styles.cardSubtitle}>
            {t('features.qrManagement.subtitle')}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={handleZalopayPriority}>
        <Shield width={24} height={24} color={colors.primary} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>
            {t('features.zalopayPriority.title')}
          </Text>
          <Text style={styles.cardSubtitle}>
            {t('features.zalopayPriority.subtitle')}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  card: {
    flex: 1,
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  cardTitle: {
    fontSize: dimensions.fontSize.md,

    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: dimensions.fontSize.sm,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
  },
});
