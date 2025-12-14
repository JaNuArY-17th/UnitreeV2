import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from '@/shared/components';
import { colors, getFontFamily, FONT_WEIGHTS, spacing, dimensions, typography } from '@/shared/themes';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Wallet01Icon, Cancel01Icon, User02Icon } from '@hugeicons/core-free-icons';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { EnsogoFlowerLogo } from '@/shared/assets/images/EnsogoFlower';
import type { TransferRecipient, RecentRecipient, TransferMethod } from '../types/transfer';

interface TransferMethodsProps {
  sectionTitle: string;
  transferMethods: TransferMethod[];
  selectedRecipient: TransferRecipient | null;
  recentRecipients: RecentRecipient[];
  onRecipientRemove: () => void;
  onTransferMethodPress: (method: 'bank' | 'wallet') => void;
  onRecipientSelect?: (recipient: RecentRecipient) => void;
  disabled?: boolean;
}

export const TransferMethods: React.FC<TransferMethodsProps> = ({
  sectionTitle,
  transferMethods,
  selectedRecipient,
  recentRecipients,
  onRecipientRemove,
  onTransferMethodPress,
  onRecipientSelect,
  disabled,
}) => {
  const { t } = useTranslation('payment');
  const renderTransferMethod = (method: TransferMethod) => {
    return (
      <TouchableOpacity
        key={method.id}
        style={styles.methodButton}
        onPress={method.onPress}
      >
        {method.icon}
        <Text style={[
          styles.methodText,
          method.id === 'bank' && styles.bankMethodText
        ]}>
          {method.text}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderRecentRecipient = (recipient: RecentRecipient) => {
    // Generate initials from bankHolder name (e.g., "NGUYEN HOANG LONG" -> "NL")
    const generateInitials = (name: string): string => {
      const words = name.trim().split(/\s+/);
      if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
      }
      const firstInitial = words[0].charAt(0).toUpperCase();
      const lastInitial = words[words.length - 1].charAt(0).toUpperCase();
      return firstInitial + lastInitial;
    };

    const initials = generateInitials(recipient.bankHolder);

    return (
      <TouchableOpacity
        key={recipient.id}
        style={styles.recipientButton}
        onPress={() => {
          if (onRecipientSelect) {
            onRecipientSelect(recipient);
          } else {
            onTransferMethodPress('wallet');
          }
        }}
      >
        <View style={styles.recipientLogoContainer}>
          <View style={[styles.bankLogo]}>
            <Text style={styles.bankLogoText}>{initials}</Text>
            <View style={styles.flowerOverlay}>
              <View style={{ top: 0.5 }}>
                <EnsogoFlowerLogo width={12} height={12} color={colors.light} />
              </View>
            </View>
          </View>
        </View>
        <Text style={styles.circleText} numberOfLines={1}>
          {recipient.bankHolder}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.transferMethodsContainer}>
      <Text style={styles.sectionTitle}>{sectionTitle}</Text>

      {/* Selected Recipient Card */}
      {selectedRecipient && (
        <View style={styles.recipientCard}>
          {/* Show Wallet icon and ESPay Wallet for isEzyWallet, ESPAY, ESPay Wallet, or QR scan with missing/unknown bankCode */}
          {(
            selectedRecipient.isEzyWallet ||
            selectedRecipient.bankCode === 'ESPAY' ||
            selectedRecipient.bankName === 'ESPay Wallet' ||
            !selectedRecipient.bankCode ||
            selectedRecipient.bankCode === ''
          ) ? (
            <View style={styles.iconContainer}>
              <EnsogoFlowerLogo width={32} height={32} focused={true} />
            </View>
          ) : (
            <View style={styles.iconContainer}>
              <HugeiconsIcon icon={User02Icon} size={32} color={colors.primary} />
            </View>
          )}
          <View style={styles.recipientInfo}>
            <Text style={styles.recipientName}>{selectedRecipient.name}</Text>
            <Text style={styles.recipientDetail}>
              {selectedRecipient.accountNumber} • {(
                selectedRecipient.isEzyWallet ||
                selectedRecipient.bankCode === 'ESPAY' ||
                selectedRecipient.bankName === 'ESPay Wallet' ||
                !selectedRecipient.bankCode ||
                selectedRecipient.bankCode === ''
              ) ? 'ESPay Wallet' : selectedRecipient.bankName}
            </Text>
          </View>
          {!disabled && (
            <TouchableOpacity onPress={onRecipientRemove}>
              <HugeiconsIcon icon={Cancel01Icon} size={22} color={colors.text.primary} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Horizontal ScrollView with Transfer Methods and Recent Recipients */}
      {!selectedRecipient && !disabled && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollContainer}
        >
          {/* Transfer Methods (2 items) */}
          {transferMethods.map(renderTransferMethod)}

          {/* Recent Recipients (max 5) */}
          {recentRecipients.slice(0, 5).map(renderRecentRecipient)}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  transferMethodsContainer: {
    // paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    ...typography.title,
    marginBottom: spacing.sm,
    // lineHeight: 28,
  },
  scrollContainer: {
    // marginBottom: spacing.sm,
  },
  scrollContent: {
    gap: spacing.sm,
    // paddingHorizontal: spacing.xs,
  },
  methodButton: {
    alignItems: 'center',
    width: 80,
  },
  recipientButton: {
    alignItems: 'center',
    width: 80,
  },
  methodIconContainer: {
    width: 40,
    height: 40,
    borderRadius: dimensions.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankIconContainer: {
    borderWidth: 1,
    borderColor: colors.blueSoft,
    borderRadius: dimensions.radius.md,
  },
  walletIconContainer: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: dimensions.radius.xxl,
  },
  methodText: {
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.primary,
    textAlign: 'center',
  },
  bankMethodText: {
    lineHeight: 18,
  },
  bankLogo: {
    width: 48,
    height: 48,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
  },
  bankLogoText: {
    fontSize: 18,
    color: colors.primary,
  },
  recipientLogoContainer: {
    position: 'relative',
  },
  flowerOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 3,
  },
  circleText: {
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.primary,
    textAlign: 'center',
    marginTop: 4,
  },
  recipientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xl,
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
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    ...typography.subtitle,
    color: colors.text.primary,
  },
  recipientDetail: {
    ...typography.body,
    color: colors.text.secondary,
  },
});
