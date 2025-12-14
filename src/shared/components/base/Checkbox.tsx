import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, FONT_WEIGHTS, getFontFamily, spacing, typography } from '@/shared/themes';
import Text from './Text';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Tick02Icon } from '@hugeicons/core-free-icons';

export interface CheckboxProps {
  label?: React.ReactNode;
  value: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  containerStyle?: any;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, value, onChange, disabled, containerStyle }) => {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={typeof label === 'string' ? label : undefined}
      onPress={() => !disabled && onChange(!value)}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={({ pressed }) => [styles.row, containerStyle, pressed && !disabled && styles.rowPressed]}
    >
      <View
        style={[
          styles.box,
          value ? styles.boxChecked : styles.boxUnchecked,
          disabled && styles.boxDisabled,
        ]}
      >
        {value ? (
          <HugeiconsIcon icon={Tick02Icon} size={16} color={disabled ? colors.text.light : colors.light} />
        ) : null}
      </View>
      {label ? (
        <View style={styles.labelWrap}>
          {typeof label === 'string' ? (
            <Text style={[styles.labelText, disabled && { color: colors.text.secondary }]}>{label}</Text>
          ) : (
            label
          )}
        </View>
      ) : null}
    </Pressable>
  );
};

const BOX_SIZE = 22;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rowPressed: { opacity: 0.85 },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  boxUnchecked: {
    backgroundColor: colors.light,
    borderColor: colors.border,
  },
  boxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  boxDisabled: {
    backgroundColor: colors.secondary,
    borderColor: colors.border,
    opacity: 0.7,
  },
  labelWrap: {
    flex: 1,
    marginLeft: spacing.sm,
    justifyContent: 'center',
  },
  labelText: {
    ...typography.subtitle,
    fontSize: 17,
    color: colors.text.primary,
    lineHeight: 22,
  },
});

export default Checkbox;
