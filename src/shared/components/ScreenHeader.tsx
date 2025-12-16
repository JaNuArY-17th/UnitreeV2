import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle, StyleProp, TextStyle } from 'react-native';
import { Heading, Text as T } from '@/shared/components/base';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { colors, FONT_WEIGHTS, getFontFamily, spacing, typography } from '@/shared/themes';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import { ChevronLeft } from '../assets';

export interface ScreenHeaderAction {
  key: string;
  icon: React.ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
}

interface ScreenHeaderProps {
  title?: string;
  subTitle?: string; // optional subtitle below title
  showBack?: boolean;
  onBackPress?: () => void;
  actions?: ScreenHeaderAction[]; // right side actions (max 2 recommended)
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>; // custom style for title
  subtitleStyle?: StyleProp<TextStyle>; // custom style for subtitle
  height?: number;
  centerTitle?: boolean;
  showRightIcons?: boolean; // set to false to hide right icons but keep space
  backIconColor?: string; // default to theme primary text color
  transparent?: boolean; // make background transparent
}

/**
 * Generic screen header with optional back button + arbitrary right actions.
 * Keeps consistent spacing & hit slop. Uses native stack navigation if available.
 * REMOVED StatusBar component to avoid conflicts with SafeAreaView
 */
const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subTitle,
  showBack = true,
  onBackPress,
  actions = [],
  containerStyle,
  titleStyle,
  subtitleStyle,
  height = 56,
  centerTitle = true,
  showRightIcons = true,
  backIconColor = colors.text.primary,
  transparent = false,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const handleBack = () => {
    if (onBackPress) onBackPress(); else if (navigation.canGoBack()) navigation.goBack();
  };

  // Check if there's no left and right content to align title left
  const hasLeftContent = showBack;
  const hasRightContent = actions.length > 0;
  const shouldAlignLeft = !hasLeftContent && !hasRightContent;
  const shouldCenterTitle = centerTitle && !shouldAlignLeft;

  return (
    <View style={[
      styles.wrapper,
      { height },
      transparent && styles.transparentWrapper,
      containerStyle
    ]}>
      {/* Left */}
      <View style={styles.leftAbsolute}>
        {showBack && (
          <Pressable
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={8}
            style={({ pressed }) => [
              styles.iconBtn,
              transparent && styles.transparentIconBtn,
              pressed && styles.pressed
            ]}
          >
            <ChevronLeft width={24} height={24} color={backIconColor} />
          </Pressable>
        )}
      </View>

      {/* Title - Centered when there's left/right content, left-aligned when there's none */}
      {title && (
        <View
          pointerEvents="none"
          style={[
            styles.titleContainer,
            shouldCenterTitle && styles.centerTitle,
            shouldAlignLeft && styles.leftAlignTitle,
          ]}
        >
          <Heading level={1} style={[styles.title, shouldAlignLeft && styles.leftAlignText, titleStyle]} numberOfLines={1}>{title}</Heading>
          {subTitle && <T variant="bodySmall" style={[styles.subtitle, shouldAlignLeft && styles.leftAlignText, subtitleStyle]}>{subTitle}</T>}
        </View>
      )}

      {/* Actions (right) - Always render container to preserve space */}
      <View style={[styles.actionsRow, styles.rightAbsolute]}>
        {showRightIcons && actions.map(a => (
          <Pressable
            key={a.key}
            onPress={a.onPress}
            accessibilityRole="button"
            accessibilityLabel={a.accessibilityLabel || a.key}
            hitSlop={8}
            style={({ pressed }) => [
              styles.iconBtn,
              transparent && styles.transparentIconBtn,
              pressed && styles.pressed
            ]}
          >
            {a.icon}
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    // backgroundColor: colors.background,
    position: 'relative',
    // borderBottomWidth: StyleSheet.hairlineWidth,
    // borderBottomColor: colors.border,
  },
  transparentWrapper: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  transparentIconBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pressed: { opacity: 0.6 },
  titleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    // This ensures the title is always centered within the full width
    paddingHorizontal: spacing.lg * 2 + 40,
  },
  centerTitle: { alignItems: 'center' },
  leftAlignTitle: {
    alignItems: 'flex-start',
    paddingHorizontal: 0, // Remove extra padding when left-aligned
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
    color: colors.text.primary,
    // flexShrink: 1,

  },
  leftAlignText: {
    textAlign: 'left',
  },
  subtitle: {
    textAlign: 'center',
    // marginTop: 1,
  },
  leftAbsolute: { position: 'absolute', left: spacing.xs },
  rightAbsolute: { position: 'absolute', right: spacing.xs },
  actionsRow: { flexDirection: 'row', alignItems: 'center' },
});

export default ScreenHeader;
