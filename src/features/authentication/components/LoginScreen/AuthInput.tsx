import React, { useState } from 'react';
import { View, StyleSheet, TextInput as RNTextInput, TouchableOpacity } from 'react-native';
import Eye from '@/shared/assets/icons/Eye';
import EyeOffIcon from '@/shared/assets/icons/EyeOffIcon';
import Text from '@/shared/components/base/Text';
import { colors } from '@/shared/themes/colors';
import { dimensions } from '@/shared/themes/dimensions';
import typographyStyles from '@/shared/themes/typography';

interface AuthInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  icon?: React.ReactNode;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad';
  editable?: boolean;
  autoFocus?: boolean;
}

const AuthInput: React.FC<AuthInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  secureTextEntry = false,
  keyboardType = 'default',
  editable = true,
  autoFocus = true
}) => {
  const [showPassword, setShowPassword] = useState(!secureTextEntry);
  const isPasswordField = secureTextEntry !== undefined && secureTextEntry;

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <RNTextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          keyboardType={keyboardType}
          secureTextEntry={isPasswordField && !showPassword}
          editable={editable}
          style={[styles.input, !editable && styles.inputDisabled]}
          autoCapitalize="none"
          autoFocus={autoFocus}
        />
        {isPasswordField && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {showPassword ? (
              <Eye width={20} height={20} color="#666" />
            ) : (
              <EyeOffIcon width={20} height={20} color="#666" />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: dimensions.spacing.lg,
  },
  label: {
    ...typographyStyles.subtitle,
    color: colors.text.light,
    marginBottom: dimensions.spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.round,
    paddingHorizontal: dimensions.spacing.lg,
    height: dimensions.components.inputHeight * 1.15,
  },
  iconContainer: {
    marginRight: dimensions.spacing.md,
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    ...typographyStyles.subtitle,
    color: colors.dark,
    paddingVertical: 0,
  },
  inputDisabled: {
    backgroundColor: colors.lightGray,
    color: colors.gray,
  },
});

export default AuthInput;
