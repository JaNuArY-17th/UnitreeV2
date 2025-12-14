import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { LockPasswordIcon, ViewIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, spacing, dimensions, typography } from '@/shared/themes';
import { Text } from '@/shared/components';

interface PasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  onBlur?: () => void;
  helperText?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChangeText,
  placeholder,
  error,
  onBlur,
  helperText,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { t } = useTranslation();
  const defaultPlaceholder = placeholder || t('login:passwordInput.placeholder');

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <HugeiconsIcon icon={LockPasswordIcon} size={20} color={colors.text.secondary} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder={defaultPlaceholder}
          placeholderTextColor={colors.text.secondary}
          secureTextEntry={!isPasswordVisible}
          autoCorrect={false}
          autoComplete='off'
          autoCapitalize="none"
          textContentType="oneTimeCode"
        />
        <TouchableOpacity
          onPress={togglePasswordVisibility}
          style={styles.eyeButton}
          activeOpacity={0.7}
        >
          {isPasswordVisible ? (
            <HugeiconsIcon icon={ViewIcon} size={20} color={colors.text.secondary} />
          ) : (
            <HugeiconsIcon icon={ViewOffSlashIcon} size={20} color={colors.text.secondary} />
          )}
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {!error && helperText && <Text style={styles.helperText}>{helperText}</Text>}
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
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
    color: colors.text.primary,
    padding: 0,
    // Ensure vertical centering across platforms
    ...(Platform.OS === 'android' ? { textAlignVertical: 'center', includeFontPadding: false } : {}),
  },
  eyeButton: {
    padding: 4,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  helperText: {
    ...typography.body,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    lineHeight: 20,
  },
});

export default PasswordInput;
