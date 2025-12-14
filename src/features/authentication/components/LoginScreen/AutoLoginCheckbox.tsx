import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Text from '@/shared/components/base/Text';
import { Tooltip } from '@/shared/components/base/Tooltip';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, spacing, typography } from '@/shared/themes';
import { AutoLoginUtils } from '@/features/authentication/utils/autoLoginUtils';



interface AutoLoginCheckboxProps {
  checked?: boolean;
  onToggle?: (checked: boolean) => void;
  color?: string;
}

export const AutoLoginCheckbox: React.FC<AutoLoginCheckboxProps> = ({
  checked = true,
  onToggle,
  color,
}) => {
  const [isChecked, setIsChecked] = useState(checked); // Start with prop value, default true
  const { t } = useTranslation();

  const tooltipText = t('login:autoLogin.tooltip');

  // Sync with parent prop changes
  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const handleToggle = () => {
    const newChecked = !isChecked;
    setIsChecked(newChecked);
    onToggle?.(newChecked);
  };

  return (
    <View style={styles.container}>
      <View style={styles.checkboxContainer}>
        <TouchableOpacity onPress={handleToggle}>
          <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
            {isChecked && <View style={[styles.checkmark, { backgroundColor: color }]} />}
          </View>
        </TouchableOpacity>

        <Text variant="body">{t('login:autoLogin.text')}</Text>

        {/* <Tooltip
          content={tooltipText}
          placement="top"
        >
          <View style={styles.infoButton}>
            <InfoIcon width={20} height={20} color={colors.text.primary} />
          </View>
        </Tooltip> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.sm
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: colors.text.secondary,
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.light,
  },
  checkboxChecked: {
    // backgroundColor: colors.primary,
    // borderColor: colors.primary,
  },
  checkmark: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  infoButton: {
    padding: 4,
  },
});
