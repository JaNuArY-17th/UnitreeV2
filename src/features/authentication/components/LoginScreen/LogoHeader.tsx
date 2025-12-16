import React from 'react';
import {
  View,
  StyleSheet,
  ImageBackground, // Import ImageBackground
  ImageSourcePropType,
  Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors } from '@/shared/themes/colors';
import { dimensions } from '@/shared/themes/dimensions';

interface LogoHeaderProps {
  primaryLogo?: React.ReactNode;
  secondaryLogo?: React.ReactNode;
}

// 1. Tạo component AnimatedImageBackground
const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);

const LogoHeader: React.FC<LogoHeaderProps> = ({
  primaryLogo,
  secondaryLogo
}) => {
  const insets = useSafeAreaInsets();

  return (
    <AnimatedImageBackground
      entering={FadeInDown.delay(200)}
      source={require('@/shared/assets/background/forest.png')}
      resizeMode="cover"
      style={styles.fullHeader}
    >
      <View
        style={[
          styles.contentWrapper,
          { paddingTop: insets.top + dimensions.spacing.md }
        ]}
      >
        {/* <View style={styles.logosContainer}>
          {secondaryLogo && (
            <Image
              source={require('@/shared/assets/logo/greenwich - logo.png')}
              style={styles.logoWrapper}
              resizeMode="contain"
            />
          )}
          {primaryLogo && (
            <Image
              source={require('@/shared/assets/logo/greenity - logo.png')}
              style={styles.logoWrapper}
              resizeMode="contain"
            />
          )}
        </View> */}
      </View>
    </AnimatedImageBackground>
  );
};

const styles = StyleSheet.create({
  fullHeader: {
    minHeight: 250,
    backgroundColor: colors.secondary,
    width: '100%',
    opacity: 0.8,
  },
  contentWrapper: {
    flex: 1,
    paddingBottom: dimensions.spacing.xxl,
  },
  logosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // paddingHorizontal: dimensions.spacing.lg,
  },
  logoWrapper: {
    flex: 1,
    height: 40,
    alignItems: 'flex-start'
  },
});

export default LogoHeader;