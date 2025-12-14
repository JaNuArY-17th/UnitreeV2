import React, { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { Pressable, StyleSheet, ViewStyle, View } from 'react-native';
import { Input } from '@/shared/components/base';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Search01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import { colors, spacing } from '@/shared/themes';

export type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmitEditing?: () => void;
  containerStyle?: ViewStyle;
  autoFocus?: boolean;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  showExternalIcon?: boolean; // Controls whether to show icon outside or inside
};

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Tìm kiếm mã OTC/niêm yết/Chứng chỉ quỹ',
  onSubmitEditing,
  containerStyle,
  autoFocus,
  rightIcon,
  onRightIconPress,
  showExternalIcon = false,
}) => {
  const handleClear = () => onChangeText('');

  // Build right adornment content for inside the input
  const rightAdornmentContent = () => {
    const elements = [];

    // Add clear button if there's text
    if (value?.length) {
      elements.push(
        <Pressable
          key="clear"
          onPress={handleClear}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={8}
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} color={colors.text.secondary} />
        </Pressable>
      );
    }

    // Add custom right icon if provided and not showing externally
    if (rightIcon && onRightIconPress && !showExternalIcon) {
      elements.push(
        <Pressable
          key="rightIcon"
          onPress={onRightIconPress}
          accessibilityRole="button"
          hitSlop={8}
          style={value?.length ? styles.rightIconWithClear : undefined}
        >
          {rightIcon}
        </Pressable>
      );
    }

    // Return container with elements if we have any
    if (elements.length > 0) {
      return (
        <View style={styles.rightAdornmentContainer}>
          {elements}
        </View>
      );
    }

    return undefined;
  };

  // Loading state for external icon
  const [externalLoading, setExternalLoading] = useState(false);

  // Render external icon with loading
  const renderExternalIcon = () => {
    if (rightIcon && onRightIconPress && showExternalIcon) {
      const handlePress = async () => {
        setExternalLoading(true);
        try {
          await Promise.resolve(onRightIconPress());
        } finally {
          setExternalLoading(false);
        }
      };
      return (
        <Pressable
          onPress={handlePress}
          accessibilityRole="button"
          hitSlop={8}
          style={styles.externalIcon}
          disabled={externalLoading}
        >
          {externalLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            rightIcon
          )}
        </Pressable>
      );
    }
    return null;
  };

  // If showing external icon, wrap in container
  if (showExternalIcon) {
    return (
      <View style={[styles.searchBarWrapper, containerStyle]}>
        <Input
          value={value}
          autoFocus={autoFocus}
          onChangeText={onChangeText}
          placeholder={placeholder}
          leftAdornment={<HugeiconsIcon icon={Search01Icon} size={24} color={colors.text.secondary} />}
          rightAdornment={rightAdornmentContent()}
          returnKeyType="search"
          onSubmitEditing={onSubmitEditing}
          autoCorrect={false}
          autoCapitalize="none"
          containerStyle={styles.inputContainer}
          // dismissKeyboardOnPress={false}
          multiline={false}
        />
        {renderExternalIcon()}
      </View>
    );
  }

  // Default behavior - icon inside
  return (
    <Input
      value={value}
      autoFocus={autoFocus}
      onChangeText={onChangeText}
      placeholder={placeholder}
      leftAdornment={<HugeiconsIcon icon={Search01Icon} size={24} color={colors.text.secondary} />}
      rightAdornment={rightAdornmentContent()}
      returnKeyType="search"
      onSubmitEditing={onSubmitEditing}
      autoCorrect={false}
      autoCapitalize="none"
      containerStyle={[styles.container, containerStyle]}
    // dismissKeyboardOnPress={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // backgroundColor"
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  inputContainer: {
    flex: 1,
  },
  externalIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.light,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    width: 48,
    height: 48,
  },
  rightAdornmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rightIconWithClear: {
    marginLeft: spacing.xs,
  },
});

export default SearchBar;
