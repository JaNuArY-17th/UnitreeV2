import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { spacing, colors } from '@/shared/themes';

const Dot = ({ delay }: { delay: number }) => {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 600, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: 0.3 + 0.7 * Math.abs(Math.sin(progress.value * Math.PI * 2 + delay)),
    transform: [{ translateY: -4 * Math.abs(Math.sin(progress.value * Math.PI * 2 + delay)) }],
  }));

  return <Animated.View style={[styles.dot, style]} />;
};

const TypingIndicator: React.FC<{ visible?: boolean }> = ({ visible }) => {
  if (!visible) return null;

  return (
    <View style={styles.container} testID="typing-indicator">
      <View style={styles.bubble}>
        <Dot delay={0} />
        <Dot delay={0.5} />
        <Dot delay={1} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
    alignItems: 'flex-start',
  },
  bubble: {
    flexDirection: 'row',
    backgroundColor: colors.light,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.text.secondary,
    marginHorizontal: 4,
  },
});

export default TypingIndicator;
