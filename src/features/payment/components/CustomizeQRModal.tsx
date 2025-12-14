import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomSheetModal } from '@/shared/components/base';
import { colors, spacing, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';
import Text from '@/shared/components/base/Text';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Tick01Icon } from '@hugeicons/core-free-icons';

interface CustomizeQRModalProps {
  visible: boolean;
  onClose: () => void;
  options: {
    showUserName: boolean;
    showPhoneNumber: boolean;
    maskPhoneNumber: boolean;
  };
  onOptionsChange: (options: {
    showUserName: boolean;
    showPhoneNumber: boolean;
    maskPhoneNumber: boolean;
  }) => void;
}

export const CustomizeQRModal: React.FC<CustomizeQRModalProps> = ({
  visible,
  onClose,
  options,
  onOptionsChange,
}) => {
  const { t } = useTranslation('payment');

  const handleUserNameChange = (value: boolean) => {
    onOptionsChange({
      ...options,
      showUserName: value,
    });
  };

  const handlePhoneNumberChange = (value: boolean) => {
    const newOptions = {
      ...options,
      showPhoneNumber: value,
    };
    // If hiding phone number, also disable masking
    if (!value) {
      newOptions.maskPhoneNumber = false;
    }
    onOptionsChange(newOptions);
  };

  const handleMaskPhoneNumberChange = (value: boolean) => {
    onOptionsChange({
      ...options,
      maskPhoneNumber: value,
    });
  };

  // Custom Checkbox component
  const CustomCheckbox = ({
    label,
    checked,
    onPress,
    disabled = false,
  }: {
    label: string;
    checked: boolean;
    onPress: () => void;
    disabled?: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.checkboxRow, disabled && styles.disabledCheckbox]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <View
        style={[
          styles.checkboxBox,
          checked ? styles.checkboxBoxChecked : styles.checkboxBoxUnchecked,
          disabled && styles.checkboxBoxDisabled,
        ]}
      >
        {checked && (
          <HugeiconsIcon icon={Tick01Icon} size={16} color={disabled ? colors.text.light : colors.light} />
        )}
      </View>
      <Text style={[styles.checkboxLabel, disabled && styles.checkboxLabelDisabled]}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title={t('customize.title', 'Customize QR')}
      maxHeightRatio={0.3}
      fillToMaxHeight
    >
      <View style={styles.container}>
        {/* Show/Hide User Name */}
        <CustomCheckbox
          label={t('customize.showUserName', 'Show user name')}
          checked={options.showUserName}
          onPress={() => handleUserNameChange(!options.showUserName)}
        />

        {/* Show/Hide Phone Number */}
        <CustomCheckbox
          label={t('customize.showPhoneNumber', 'Show phone number')}
          checked={options.showPhoneNumber}
          onPress={() => handlePhoneNumberChange(!options.showPhoneNumber)}
        />

        {/* Mask Phone Number */}
        <CustomCheckbox
          label={t('customize.maskPhoneNumber', 'Show only last 3 digits of phone number')}
          checked={options.maskPhoneNumber}
          onPress={() => handleMaskPhoneNumberChange(!options.maskPhoneNumber)}
          disabled={!options.showPhoneNumber}
        />
      </View>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    // gap: spacing.lg,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  disabledCheckbox: {
    opacity: 0.5,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    flexShrink: 0,
  },
  checkboxBoxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxBoxUnchecked: {
    backgroundColor: colors.light,
    borderColor: colors.border,
  },
  checkboxBoxDisabled: {
    backgroundColor: colors.secondary,
    borderColor: colors.border,
  },
  checkboxLabel: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 22,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    flex: 1,
  },
  checkboxLabelDisabled: {
    color: colors.text.secondary,
  },
});
