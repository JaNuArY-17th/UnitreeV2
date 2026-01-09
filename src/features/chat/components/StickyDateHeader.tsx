import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import DateHeader from './DateHeader';

const StickyDateHeader: React.FC<{ title?: string }> = ({ title }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(title ? 1 : 0, { duration: 250 });
  }, [title]);

  const aStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * -8 }],
  }));

  return (
    <Animated.View style={[styles.container, aStyle]} pointerEvents="none">
      <DateHeader title={title} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 6,
    zIndex: 20,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
});

export default StickyDateHeader;
