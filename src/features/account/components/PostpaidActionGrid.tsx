import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { colors, spacing, typography } from '@/shared/themes';
import Text from '@/shared/components/base/Text';
import { useTranslation } from '@/shared/hooks/useTranslation';
import {
  Invoice01Icon,
  Settings02Icon,
  BookOpen01Icon,
} from '@hugeicons/core-free-icons';

const { width } = Dimensions.get('window');

interface PostpaidActionGridProps {
  onInstallmentPress: () => void;
  onPayDebtPress: () => void;
  onSettingsPress: () => void;
  colors?: {
    primary?: string;
  };
}

const PostpaidActionGrid: React.FC<PostpaidActionGridProps> = ({
  onInstallmentPress,
  onPayDebtPress,
  onSettingsPress,
  colors: customColors,
}) => {
  const { t } = useTranslation('account');

  const ActionButton = ({ icon, label, onPress, color }: { icon: any, label: string, onPress: () => void, color?: string }) => (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
      <View style={[styles.actionIconContainer, { borderColor: color || colors.primary }]}>
        <HugeiconsIcon icon={icon} size={28} color={color || colors.primary} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.actionsContainer}>
      <ActionButton
        icon={BookOpen01Icon}
        label={t('postpaid.actions.installmentManagement')}
        onPress={onInstallmentPress}
        color={customColors?.primary || colors.primary}
      />
      <ActionButton
        icon={Invoice01Icon}
        label={t('postpaid.actions.payDebt')}
        onPress={onPayDebtPress}
        color={customColors?.primary || colors.primary}
      />
      <ActionButton
        icon={Settings02Icon}
        label={t('postpaid.actions.settings')}
        onPress={onSettingsPress}
        color={customColors?.primary || colors.primary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xl,
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width / 3.5,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28, // Circle
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    backgroundColor: colors.light,
  },
  actionLabel: {
    ...typography.caption,
    textAlign: 'center',
    color: colors.text.primary,
    fontWeight: '500',
  },
});

export default PostpaidActionGrid;
