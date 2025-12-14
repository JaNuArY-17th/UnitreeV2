import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';
import { Body, Button } from '@/shared/components/base';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ChampionIcon } from '@hugeicons/core-free-icons';

interface ProsperityWalletSectionProps {
  onOpenWallet: () => void;
}

export const ProsperityWalletSection: React.FC<ProsperityWalletSectionProps> = ({
  onOpenWallet,
}) => {
  const { t } = useTranslation('payment');

  return (
    <View style={styles.prosperitySection}>
      <View style={styles.prosperityContent}>
        <View style={styles.prosperityIcon}>
          <HugeiconsIcon icon={ChampionIcon} size={24} color={colors.primary} />
        </View>
        <View style={styles.prosperityTextContainer}>
          <Body style={styles.prosperityTitle}>
            {t('receiveMoney.prosperityWallet', 'Ví thịnh vượng')}
          </Body>
          <Body style={styles.prosperityDescription}>
            {t('receiveMoney.prosperityDescription', 'Nhận thưởng và ưu đãi')}
          </Body>
        </View>
      </View>
      <Button
        label={t('receiveMoney.openWallet', 'Mở ví')}
        variant="primary"
        size="sm"
        onPress={onOpenWallet}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  prosperitySection: {
    margin: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prosperityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  prosperityIcon: {
    width: 40,
    height: 40,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prosperityIconText: {
    fontSize: 24,
  },
  prosperityTextContainer: {
    flex: 1,
  },
  prosperityTitle: {
    fontSize: 14,

    color: colors.text.primary,
  },
  prosperityDescription: {
    fontSize: 12,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
});
