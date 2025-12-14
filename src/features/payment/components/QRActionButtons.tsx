import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';
import { Body } from '@/shared/components/base';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Download01Icon, Settings02Icon, Share01Icon } from '@hugeicons/core-free-icons';

interface QRActionButtonsProps {
  onDownload: () => void;
  onCustomize: () => void;
  onShare: () => void;
}

export const QRActionButtons: React.FC<QRActionButtonsProps> = ({
  onDownload,
  onCustomize,
  onShare,
}) => {
  const { t } = useTranslation('payment');

  return (
    <View style={styles.actionButtons}>
      <TouchableOpacity style={styles.actionButton} onPress={onDownload}>
        <HugeiconsIcon icon={Download01Icon} size={20} color={colors.primary} />
        <Body style={styles.actionText}>
          {t('receiveMoney.download', 'Tải xuống')}
        </Body>
      </TouchableOpacity>

      <View style={styles.verticalDivider} />

      <TouchableOpacity style={styles.actionButton} onPress={onCustomize}>
        <HugeiconsIcon icon={Settings02Icon} size={20} color={colors.primary} />
        <Body style={styles.actionText}>
          {t('receiveMoney.customize', 'Tùy chỉnh')}
        </Body>
      </TouchableOpacity>

      <View style={styles.verticalDivider} />

      <TouchableOpacity style={styles.actionButton} onPress={onShare}>
        <HugeiconsIcon icon={Share01Icon} size={20} color={colors.primary} />
        <Body style={styles.actionText}>
          {t('receiveMoney.share', 'Chia sẻ')}
        </Body>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  actionText: {
    color: colors.text.primary,
    marginTop: spacing.xs,
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    textAlign: 'center',
  },
  verticalDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
});
