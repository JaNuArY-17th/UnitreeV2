import React from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';
import Text from '@/shared/components/base/Text';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Call02Icon } from '@hugeicons/core-free-icons';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, spacing, dimensions } from '@/shared/themes';
import { getFontFamily, getPlatformFontExtras, FONT_WEIGHTS } from '@/shared/themes/fonts';

interface ForgotPasswordPhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const ForgotPasswordPhoneInput: React.FC<ForgotPasswordPhoneInputProps> = ({
  value,
  onChangeText,
  placeholder,
}) => {
  const { t } = useTranslation();
  const defaultPlaceholder = placeholder || t('forgotPassword:phoneInput.placeholder');
  const label = t('forgotPassword:phoneInput.label');

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <HugeiconsIcon icon={Call02Icon} size={24} color={colors.text.secondary} />
        <View style={styles.textContainer}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={defaultPlaceholder}
            placeholderTextColor={colors.text.primary}
            keyboardType="phone-pad"
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: dimensions.radius.lg,
    backgroundColor: colors.light,
    gap: spacing.md,
    minHeight: 72,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    ...getPlatformFontExtras(FONT_WEIGHTS.REGULAR),
  },
  input: {
    fontSize: 16,
    color: colors.text.primary,
    padding: 0,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    ...getPlatformFontExtras(FONT_WEIGHTS.REGULAR),
    // Ensure vertical centering across platforms
    ...(Platform.OS === 'android' ? { textAlignVertical: 'center', includeFontPadding: false } : {}),
  },
});
