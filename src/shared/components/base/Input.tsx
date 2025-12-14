import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput as RNTextInput,
  StyleSheet,
  TextInputProps as RNTextInputProps,
  Pressable,
  Platform,
} from 'react-native';
import { colors, spacing } from '../../themes';
import { getFontFamily, getPlatformFontExtras } from '../../themes/fonts';
import Text from './Text';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ViewIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons';

export type InputProps = {
  label?: string;
  error?: string;
  helperText?: string;
  secure?: boolean;
  rightAdornment?: React.ReactNode;
  leftAdornment?: React.ReactNode;
  containerStyle?: any;
  inputContainerStyle?: any;
} & RNTextInputProps;

const Input = forwardRef<RNTextInput, InputProps>(({
  label,
  error,
  helperText,
  secure,
  rightAdornment,
  leftAdornment,
  containerStyle,
  inputContainerStyle,
  style,
  ...rest
}, ref) => {
  const [isSecure, setIsSecure] = useState(!!secure);

  const showToggle = secure && rightAdornment === undefined;

  const inputContent = (
    <View style={containerStyle}>
      {label ? (
        <Text variant="subtitle" style={styles.label}>
          {label}
        </Text>
      ) : null}

      <View style={[inputContainerStyle ? inputContainerStyle : styles.inputContainer, error && styles.errorContainer]}>
        {leftAdornment && <View style={styles.leftAdornment}>{leftAdornment}</View>}

        <RNTextInput
          ref={ref}
          style={[styles.input, style]}
          secureTextEntry={isSecure}
          placeholderTextColor={colors.text.secondary}
          {...rest}
        />

        {showToggle && (
          <Pressable
            onPress={() => setIsSecure(!isSecure)}
            style={styles.rightAdornment}
          >
            {isSecure ? (
              <HugeiconsIcon icon={ViewOffSlashIcon} size={20} color={colors.text.secondary} />
            ) : (
              <HugeiconsIcon icon={ViewIcon} size={20} color={colors.text.secondary} />
            )}
          </Pressable>
        )}

        {rightAdornment && !showToggle && (
          <View style={styles.rightAdornment}>{rightAdornment}</View>
        )}
      </View>

      {error ? (
        <Text variant="caption" style={styles.errorText}>
          {error}
        </Text>
      ) : helperText ? (
        <Text variant="caption" style={styles.helperText}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );

  return inputContent;
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  label: {
    marginBottom: spacing.xs,
    color: colors.text.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    height: 48,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.light,
  },
  errorContainer: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    fontFamily: getFontFamily(),
    ...getPlatformFontExtras(),
    paddingVertical: 0,
    ...(Platform.OS === 'android' ? { textAlignVertical: 'center', includeFontPadding: false } : {}),
    backgroundColor: colors.light,
  },
  leftAdornment: {
    marginRight: spacing.sm,
  },
  rightAdornment: {
    marginLeft: spacing.sm,
  },
  errorText: {
    marginTop: spacing.xs,
    color: colors.danger,
  },
  helperText: {
    marginTop: spacing.xs,
    color: colors.text.secondary,
  },
});

export default Input;
