import React, { useRef } from 'react';
import { View, StyleSheet, Pressable, Dimensions, Animated, ViewStyle } from 'react-native';
import Text from '@/shared/components/base/Text';
import { colors, dimensions, spacing, typography } from '@/shared/themes';
import { HugeiconsIcon } from '@hugeicons/react-native';
import type { HugeiconsProps } from '@hugeicons/react-native';

const { width } = Dimensions.get('window');

export interface ActionItemData {
  id: string;
  title: string;
  icon: HugeiconsProps['icon'];
  onPress: () => void;
  backgroundColor?: string;
}

interface ActionItemProps {
  item: ActionItemData;
  textColor?: string;
  variant?: 'default' | 'light';
}

export const ActionItem: React.FC<ActionItemProps> = ({ item, textColor, variant = 'default' }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      style={styles.actionItem}
      onPress={item.onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.actionContent, { transform: [{ scale: scaleValue }] }]}>
        <View style={[
          styles.actionIcon,
          variant === 'light' && { backgroundColor: colors.primaryLight }
        ]}>
          <HugeiconsIcon icon={item.icon} size={28} color={colors.primary} />
        </View>

        <Text style={[styles.actionTitle, textColor ? { color: textColor } : undefined]} numberOfLines={2}>{item.title}</Text>
      </Animated.View>
    </Pressable>
  );
};



interface ActionGridProps {
  actions: ActionItemData[];
  textColor?: string;
  style?: ViewStyle;
  variant?: 'default' | 'light';
}

export const ActionGrid: React.FC<ActionGridProps> = ({ actions, textColor, style, variant = 'default' }) => {
  return (
    <View style={[styles.actionsContainer, style]}>
      <View style={styles.actionsGrid}>
        {actions.map((item) => (
          <ActionItem key={item.id} item={item} textColor={textColor} variant={variant} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actionsContainer: {
    paddingHorizontal: spacing.xs,
    // marginBottom: spacing.sm,
    // top: -80
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: {
    width: (width - spacing.lg * 2 - spacing.md * 3) / 4,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  actionContent: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: dimensions.radius.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    // borderWidth: 1,
    // borderColor: colors.border,
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  actionTitle: {
    ...typography.bodySmall,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 2,
  },
});
