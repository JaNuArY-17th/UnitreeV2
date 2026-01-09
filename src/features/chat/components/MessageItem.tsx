import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Message } from '../types';
import { colors, spacing } from '@/shared/themes';

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isMine = message.mine;
  return (
    <View style={[styles.bubble, isMine ? styles.mine : styles.theirs]}>
      <Text style={styles.text}>{message.text}</Text>
    </View>
  );
};

const AnimatedMessage: React.FC<{ message: Message }> = ({ message }) => {
  const progress = useSharedValue(0);
  React.useEffect(() => {
    progress.value = withTiming(1, { duration: 300 });
  }, []);

  const aStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 8 }],
  }));

  return (
    <Animated.View style={[styles.container, aStyle]}>
      <MessageBubble message={message} />
    </Animated.View>
  );
};

const MessageItem: React.FC<{ message: Message }> = ({ message }) => {
  return <AnimatedMessage message={message} />;
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    maxWidth: '80%',
  },
  mine: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
  },
  theirs: {
    backgroundColor: colors.light,
    alignSelf: 'flex-start',
  },
  text: {
    color: colors.text.primary,
  },
});

export default React.memo(MessageItem);
