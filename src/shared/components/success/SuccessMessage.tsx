import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing, dimensions } from '@/shared/themes';
import { Heading, Body } from '@/shared/components/base';

interface SuccessMessageProps {
  title: string;
  subtitle?: string;
  style?: any;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({
  title,
  subtitle,
  style
}) => {
  return (
    <View style={[styles.container, style]}>
      <Heading level={1} style={styles.title}>
        {title}
      </Heading>
      <Body style={styles.subtitle}>
        {subtitle}
      </Body>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  title: {
    textAlign: 'center',
    // marginBottom: spacing.md,
    color: colors.text.primary,
    // fontSize: dimensions.fontSize.header + 2,
    lineHeight: 32,
    letterSpacing: 0.3,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.text.secondary,
    lineHeight: 24,
    // fontSize: dimensions.fontSize.lg,
    paddingHorizontal: spacing.sm,
    // maxWidth: '90%',
  },
});

export default SuccessMessage;
