import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ViewStyle
} from 'react-native';
import Animated from 'react-native-reanimated';
import Text from '@/shared/components/base/Text';
import { colors, spacing, typography, subscribeToColorChanges } from '@/shared/themes';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Notification01Icon, SecurityCheckIcon, SecurityValidationIcon, SecurityBlockIcon } from '@hugeicons/core-free-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

interface HomeHeaderProps {
  businessName: string;
  status?: 'PENDING' | 'APPROVED' | 'LOCKED';
  onNotificationPress?: () => void;
  hasNotification?: boolean;
  children?: React.ReactNode;
  style?: ViewStyle;
  backgroundStyle?: any; // Animated style
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  businessName,
  status,
  onNotificationPress,
  hasNotification = false,
  children,
  style,
  backgroundStyle,
}) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('home');
  const [currentColors, setCurrentColors] = useState(() => ({ primary: colors.primary }));

  // Subscribe to color changes
  useEffect(() => {
    const unsubscribe = subscribeToColorChanges((newColors: ReturnType<typeof import('@/shared/themes/colors').getColors>) => {
      setCurrentColors({ primary: newColors.primary });
    });
    return unsubscribe;
  }, []);

  // Get status icon and color
  const getStatusInfo = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'APPROVED':
        return { icon: <HugeiconsIcon icon={SecurityCheckIcon} size={16} color={colors.success} /> };
      case 'PENDING':
        return { icon: <HugeiconsIcon icon={SecurityValidationIcon} size={16} color={colors.warning} /> };
      case 'LOCKED':
        return { icon: <HugeiconsIcon icon={SecurityBlockIcon} size={16} color={colors.danger} /> };
      default:
        return null;
    }
  };

  const statusInfo = getStatusInfo(status);

  return (
    <View
      style={[styles.container, { paddingTop: insets.top }, style]}
    >
      <Animated.View style={[styles.backgroundLayer, { backgroundColor: currentColors.primary }, backgroundStyle]}>
        <View style={styles.headerOverlay} />
      </Animated.View>

      <View style={[styles.headerContent]}>
        <View style={[styles.headerTop]}>
          <View style={styles.businessInfo}>
            <Text style={styles.businessName} numberOfLines={2}>
              {businessName}
              {statusInfo && (
                <View style={styles.statusIconContainer}>
                  {statusInfo.icon}
                </View>
              )}
            </Text>
          </View>

          <Pressable style={styles.notificationButton} onPress={onNotificationPress}>
            <HugeiconsIcon icon={Notification01Icon} size={24} color={colors.light} />
            {hasNotification && <View style={styles.notificationDot} />}
          </Pressable>
        </View>
      </View>

      {children}
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    // paddingBottom: spacing.md,
    paddingVertical: spacing.md,
    width: '100%',
    overflow: 'visible', // Allow background to overflow
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    // backgroundColor removed - now set dynamically via inline style
    zIndex: -1,
  },
  headerBackgroundImage: {
    resizeMode: 'cover',
    ...StyleSheet.absoluteFillObject,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(43, 43, 43, 0.48)',
  },
  headerContent: {
    // flex: 1,
    paddingHorizontal: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  businessInfo: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  businessDetails: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'blue',
  },
  businessName: {
    ...typography.h2,
    lineHeight: 0,
    color: colors.light,
    textTransform: 'capitalize',
    width: '85%'
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4040',
    borderWidth: 1,
    borderColor: colors.light,
  },
  statusBadge: {
  },
  statusIconContainer: {
    position: 'absolute',
    paddingBottom: spacing.sm,
  },
});
