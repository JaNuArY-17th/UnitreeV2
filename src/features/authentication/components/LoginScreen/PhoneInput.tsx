import React from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Call02Icon } from '@hugeicons/core-free-icons';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, spacing, dimensions, typography } from '@/shared/themes';
import { Text } from '@/shared/components';

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  onBlur?: () => void;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChangeText,
  placeholder,
  error,
  onBlur,
}) => {
  const { t } = useTranslation();
  const defaultPlaceholder = placeholder || t('login:phoneInput.placeholder');

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <HugeiconsIcon icon={Call02Icon} size={20} color={colors.text.secondary} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder={defaultPlaceholder}
          placeholderTextColor={colors.text.secondary}
          keyboardType="phone-pad"
          autoCorrect={false}
          autoCapitalize="none"
          maxLength={10}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
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
  },
  inputError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    ...typography.subtitle,
    fontWeight: '400',
    color: colors.text.primary,
    // letterSpacing: 0.5,
    padding: 0,
    // Ensure vertical centering across platforms
    // ...(Platform.OS === 'android' ? { textAlignVertical: 'center', includeFontPadding: false } : {}),
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
});

export default PhoneInput;
