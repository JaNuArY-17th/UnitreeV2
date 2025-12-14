import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '@/shared/themes';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Share01Icon, Exchange01Icon } from '@hugeicons/core-free-icons';
import Button from '@/shared/components/base/Button';

interface ActionButtonsProps {
  onShare?: () => void;
  onTransfer?: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onShare,
  onTransfer,
}) => {
  const { t } = useTranslation('transactions');

  return (
    <View style={styles.container}>
      <Button
        label={t('transactionDetail.share')}
        onPress={onShare}
        variant="outline"
        size="md"
        leftIcon={<HugeiconsIcon icon={Share01Icon} size={20} color={colors.primary} />}
        style={styles.button}
      />
      <Button
        label={t('transactionDetail.transfer')}
        onPress={onTransfer}
        variant="primary"
        size="md"
        leftIcon={<HugeiconsIcon icon={Exchange01Icon} size={20} color={colors.light} />}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  button: {
    flex: 1,
  },
});

export default ActionButtons;
