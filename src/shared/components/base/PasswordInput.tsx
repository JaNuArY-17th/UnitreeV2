import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { LockPasswordIcon, ViewIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, spacing, dimensions } from '@/shared/themes';
import { FONT_WEIGHTS, getFontFamily, getPlatformFontExtras } from '@/shared/themes/fonts';
import Text from '@/shared/components/base/Text';

interface PasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  style?: any;
  containerStyle?: any;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  textContentType?: 'password' | 'newPassword';
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  helperText,
  style,
  containerStyle,
  autoCapitalize = 'none',
  autoCorrect = false,
  textContentType = 'password',
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { t } = useTranslation();
  const defaultPlaceholder = placeholder || t('login:passwordInput.placeholder');

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      <View style={[
        styles.inputContainer,
        error && styles.inputContainerError,
        style
      ]}>
        <HugeiconsIcon icon={LockPasswordIcon} size={20} color={colors.text.secondary} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={defaultPlaceholder}
          placeholderTextColor={colors.text.secondary}
          secureTextEntry={!isPasswordVisible}
          autoCorrect={autoCorrect}
          autoCapitalize={autoCapitalize}
          textContentType={textContentType}
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
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      {helperText && !error && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: dimensions.fontSize.lg,

    color: colors.text.primary,
    marginBottom: spacing.xs,
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
  inputContainerError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    padding: 0,
    fontFamily: getFontFamily(),
    ...getPlatformFontExtras(),
    // Ensure vertical centering across platforms
    ...(Platform.OS === 'android' ? { textAlignVertical: 'center', includeFontPadding: false } : {}),
  },
  eyeButton: {
    padding: 4,
  },
  errorText: {
    fontSize: dimensions.fontSize.sm,
    color: colors.danger,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
  helperText: {
    fontSize: dimensions.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
});

export default PasswordInput;
