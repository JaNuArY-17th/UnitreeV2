import React, { useEffect, useRef, createContext, useContext } from 'react';
import { View, StyleSheet, Pressable, Animated, Keyboard } from 'react-native';
import Text from '@/shared/components/base/Text';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, FONT_WEIGHTS } from '@/shared/themes';
import { useStoreStatus } from '../../features/authentication/hooks/useStoreStatus';
import { useAccountType } from '../../features/authentication/hooks/useAccountType';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  ArrowRight01Icon,
  Store01Icon,
  Clock01Icon,
  SecurityLockIcon,
} from '@hugeicons/core-free-icons';

// Context to let children know if they're disabled
const OverlayDisabledContext = createContext(false);
export const useIsOverlayDisabled = () => useContext(OverlayDisabledContext);

interface ActiveRequiredOverlayProps {
  children?: React.ReactNode;
  backgroundColor?: string;
  showHeader?: boolean;
}

type StoreStatusType = 'LOCKED' | 'PENDING' | undefined;

/**
 * StoreStatusBanner - Shows a banner when store account needs attention
 * Similar to VerificationBanner but for store status
 */
const StoreStatusBanner: React.FC<{
  status: StoreStatusType;
  style?: any;
}> = ({ status, style }) => {
  const { t } = useTranslation('storeStatus');
  const navigation = useNavigation();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] });
  const fade = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] });

  const getConfig = () => {
    switch (status) {
      case 'LOCKED':
        return {
          icon: SecurityLockIcon,
          title: t('banner.locked.title'),
          bgColor: colors.danger,
          iconBgColor: 'rgba(220, 53, 69, 0.3)',
          onPress: () => {
            // Navigate to support or show contact info
            console.log('Contact support for locked account');
          },
        };
      case 'PENDING':
        return {
          icon: Clock01Icon,
          title: t('banner.pending.title'),
          bgColor: colors.warning,
          iconBgColor: 'rgba(255, 193, 7, 0.2)',
          onPress: () => {
            // Could navigate to status page or refresh
            console.log('Check pending status');
          },
        };
      default:
        // undefined status - likely needs to create store
        return {
          icon: Store01Icon,
          title: t('banner.createStore.title'),
          bgColor: colors.warning,
          iconBgColor: 'rgba(255, 193, 7, 0.2)',
          onPress: () => {
            navigation.navigate('CreateStore' as never);
          },
        };
    }
  };

  const config = getConfig();

  return (
    <Pressable
      style={[styles.bannerContainer, { backgroundColor: config.bgColor, borderColor: config.bgColor }, style]}
      accessibilityRole="button"
      accessibilityLabel={config.title}
      onPress={config.onPress}
    >
      <View style={styles.bannerRow}>
        <View style={styles.bannerLeading}>
          <View style={[styles.bannerIconWrap, { backgroundColor: config.iconBgColor }]}>
            <HugeiconsIcon icon={config.icon} size={24} color={colors.light} />
            <Animated.View style={[styles.bannerPulseDot, { opacity: fade, transform: [{ scale }] }]} />
          </View>
        </View>

        <Text variant="body" weight={FONT_WEIGHTS.REGULAR} style={styles.bannerTitle}>
          {config.title}
        </Text>

        <View style={styles.bannerTrailing}>
          <HugeiconsIcon icon={ArrowRight01Icon} size={16} color={colors.light} />
        </View>
      </View>
    </Pressable>
  );
};

const ActiveRequiredOverlay: React.FC<ActiveRequiredOverlayProps> = ({
  children,
  backgroundColor = colors.light,
  showHeader = true
}) => {
  const { storeStatus, isLoading: isStatusLoading } = useStoreStatus();
  const { accountType } = useAccountType();

  // Only apply for STORE accounts
  if (accountType !== 'STORE') {
    return <>{children}</>;
  }

  // If store is APPROVED, render children normally
  if (storeStatus === 'APPROVED') {
    return <>{children}</>;
  }

  // Handle loading state - show children while loading to prevent flash
  if (isStatusLoading && storeStatus === undefined) {
    return <>{children}</>;
  }

  // Show banner overlay for non-approved stores
  // The banner appears at the top, content below is disabled with overlay
  return (
    <OverlayDisabledContext.Provider value={true}>
      <DisabledOverlayContent storeStatus={storeStatus as StoreStatusType}>
        {children}
      </DisabledOverlayContent>
    </OverlayDisabledContext.Provider>
  );
};

/**
 * Separate component to handle keyboard dismissal with useEffect
 */
const DisabledOverlayContent: React.FC<{
  storeStatus: StoreStatusType;
  children: React.ReactNode;
}> = ({ storeStatus, children }) => {
  // Dismiss keyboard on mount and whenever this component renders
  useEffect(() => {
    // Dismiss immediately
    Keyboard.dismiss();

    // Also dismiss after a short delay to catch any delayed autofocus
    const timer = setTimeout(() => {
      Keyboard.dismiss();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.overlayContainer}>
      {/* Banner at top */}
      <StoreStatusBanner status={storeStatus} style={styles.bannerMargin} />

      {/* Children with disabled overlay - pointerEvents="none" prevents all touch including focus */}
      <View style={styles.childrenContainer} pointerEvents="none">
        {children}
      </View>

      {/* Overlay on top to show disabled state visually */}
      <View style={styles.disabledOverlay} pointerEvents="none">
        <View style={styles.overlayBackground} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
  },
  childrenContainer: {
    flex: 1,
  },
  disabledOverlay: {
    ...StyleSheet.absoluteFillObject,
    top: 70, // Account for banner height
    zIndex: 10,
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  bannerMargin: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    zIndex: 20,
  },
  // Banner styles (similar to VerificationBanner)
  bannerContainer: {
    position: 'relative',
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerTitle: {
    color: colors.light,
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  bannerTrailing: {
    marginLeft: spacing.md,
  },
  bannerLeading: {
    marginRight: spacing.md,
  },
  bannerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerPulseDot: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.light,
  },
});

export default ActiveRequiredOverlay;
