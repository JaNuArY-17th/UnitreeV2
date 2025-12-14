import React from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { UserIcon } from '@hugeicons/core-free-icons';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, spacing, dimensions } from '@/shared/themes';
import { getFontFamily, getPlatformFontExtras } from '@/shared/themes/fonts';

interface FullNameInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const FullNameInput: React.FC<FullNameInputProps> = ({
  value,
  onChangeText,
  placeholder,
}) => {
  const { t } = useTranslation();
  const defaultPlaceholder = placeholder || t('signup:fullNameInput.placeholder');

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <HugeiconsIcon icon={UserIcon} size={20} color={colors.text.secondary} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={defaultPlaceholder}
          placeholderTextColor={colors.text.secondary}
          autoCorrect={false}
          autoCapitalize="words"
        />
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
});
