import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing, colors } from '@/shared/themes';

const DateHeader: React.FC<{ title?: string }> = ({ title }) => {
  if (!title) return null;
  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.pill}>
        <Text style={styles.text}>{title}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  pill: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderColor: colors.border,
    borderWidth: 1,
  },
  text: {
    color: colors.text.secondary,
    fontSize: 12,
  },
});

export default DateHeader;
