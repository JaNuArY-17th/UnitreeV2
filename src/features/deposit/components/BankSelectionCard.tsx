import React from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { colors, FONT_WEIGHTS, getFontFamily, spacing, typography, dimensions } from '@/shared/themes';
import { Body, Text } from '@/shared/components/base';
import { useTranslation } from '@/shared/hooks/useTranslation';
import type { SelectableBank } from '../hooks/useSelectableBanks';
import type { VietQRBank } from '../types/bank';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowRight01Icon, BankIcon } from '@hugeicons/core-free-icons';


type BankSelection = SelectableBank | VietQRBank;

interface BankSelectionCardProps {
  selectedBank?: BankSelection;
  onPress: () => void;
}

const BankSelectionCard: React.FC<BankSelectionCardProps> = ({
  selectedBank,
  onPress,
}) => {
  const { t } = useTranslation('deposit');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={selectedBank ? `Selected bank: ${(
        (selectedBank as any)?.short_name || (selectedBank as any)?.shortName || selectedBank.name || 'Bank'
      )}` : 'Select bank'}
      style={[styles.container, selectedBank && styles.containerSelected]}
    >
      <View style={styles.content}>
        {selectedBank ? (
          <View style={styles.bankRow}>
            <View style={[styles.logoContainer, selectedBank && styles.logoContainerSelected]}>
              {selectedBank.logo ? (
                <Image
                  source={typeof (selectedBank as any).logo === 'string' ? { uri: (selectedBank as any).logo } : (selectedBank as any).logo}
                  style={styles.bankLogo}
                  resizeMode="contain"
                />
              ) : (
                <HugeiconsIcon icon={BankIcon} size={24} color={selectedBank ? colors.light : colors.text.secondary} />
              )}
            </View>
            <View style={styles.bankDetails}>
              <Text style={[styles.bankShortName, selectedBank && styles.bankShortNameSelected]}>
                {(selectedBank as any).short_name || (selectedBank as any).shortName || selectedBank.name}
              </Text>
              <Body style={[styles.bankFullName, selectedBank && styles.bankFullNameSelected]} numberOfLines={1}>
                {selectedBank.name}
              </Body>
            </View>
          </View>
        ) : (
          <View style={styles.placeholderRow}>
            <HugeiconsIcon icon={BankIcon} size={24} color={colors.primary} />
            <Body style={styles.placeholder}>
              {t('bankSelection.title')}
            </Body>
          </View>
        )}
      </View>

      <View style={[styles.arrow, selectedBank && styles.arrowSelected]}>
        <HugeiconsIcon icon={ArrowRight01Icon} size={20} color={colors.primary} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginVertical: spacing.sm,
    // marginHorizontal: spacing.xl,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  containerSelected: {
    backgroundColor: colors.primaryLight,
  },
  content: {
    flex: 1,
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  placeholderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoContainer: {
    // width: 56,
    // height: 56,
    // borderRadius: 16,
    // backgroundColor: colors.light,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  logoContainerSelected: {
    // backgroundColor: colors.light,
  },
  bankLogo: {
    width: 56,
    height: 56,
    // borderRadius: 12,
  },
  bankDetails: {
    flex: 1,
  },
  bankShortName: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: 2,
    // fontFamily: getFontFamily(FONT_WEIGHTS.BOLD),
  },
  bankShortNameSelected: {
    color: colors.primary,
  },
  bankFullName: {
    ...typography.caption,
    color: colors.primary,
  },
  bankFullNameSelected: {
    color: colors.primary,
  },
  placeholder: {
    ...typography.body,
    color: colors.primary,
    fontFamily: getFontFamily(FONT_WEIGHTS.SEMIBOLD),
  },
  arrow: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.light,
    marginLeft: spacing.sm,
  },
  arrowSelected: {
    backgroundColor: colors.light,
  },
});

export default BankSelectionCard;
