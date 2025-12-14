import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing, colors, dimensions } from '@/shared/themes';
import { SuccessIcon } from '@/shared/components/icons';

interface SuccessIllustrationProps {
  width?: number;
  height?: number;
  style?: any;
}

const SuccessIllustration: React.FC<SuccessIllustrationProps> = ({
  width = 140,
  height = 120,
  style
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <SuccessIcon width={width} height={height} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    // paddingVertical: spacing.xxl,
  },
  iconContainer: {
    // backgroundColor: colors.successSoft,
    borderRadius: dimensions.radius.round,
    padding: spacing.xxl,
  },
});

export default SuccessIllustration;
