import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors } from '@/shared/themes/colors';
import { dimensions } from '@/shared/themes/dimensions';

const { width } = Dimensions.get('window');

interface LogoHeaderProps {
  primaryLogo?: React.ReactNode;
  secondaryLogo?: React.ReactNode;
}

const LogoHeader: React.FC<LogoHeaderProps> = ({ primaryLogo, secondaryLogo }) => {
  const insets = useSafeAreaInsets();

  return (
    <Animated.View
      entering={FadeInDown.delay(200)}
      style={[styles.container, { paddingTop: insets.top + 20 }]}
    >
      <View style={styles.logosContainer}>
        {primaryLogo && (
          <View style={styles.logoWrapper}>
            {primaryLogo}
          </View>
        )}
        {secondaryLogo && (
          <View style={styles.logoWrapper}>
            {secondaryLogo}
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.secondary,
    paddingBottom: dimensions.spacing.xxl,
  },
  logosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: dimensions.spacing.lg,
  },
  logoWrapper: {
    flex: 1,
  },
});

export default LogoHeader;
