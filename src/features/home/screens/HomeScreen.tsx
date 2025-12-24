import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Text
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStatusBarEffect } from '@/shared/utils/StatusBarManager';
import { spacing, colors } from '@/shared/themes';
import { getLoadingAnimation } from '@/shared/assets/animations';
import {
  HomeHeader,
  SessionTimer,
  CurrentWiFiCard,
  ActionButtons,
  ActionButtonConfig,
  DiscoverCards,
  DiscoverCardConfig,
} from '../components';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TIMER_HEIGHT = 150; // Approximate height including padding
const WIFI_CARD_HEIGHT = 100; // Approximate height

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('Alex');
  const [pointsGained, setPointsGained] = useState(2450);
  const [wifiName, setWifiName] = useState('Starbucks_5G');
  const [signalStrength, setSignalStrength] = useState<'Excellent' | 'Good' | 'Fair' | 'Poor'>('Excellent');
  const [wifiSpeed, setWifiSpeed] = useState(120);
  const [activeButtonId, setActiveButtonId] = useState('redeem');
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(true);

  // Scroll animation values
  const scrollOffsetAnim = useSharedValue(0);

  // Animation styles for scroll-driven animations
  const timerAnimStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          scrollOffsetAnim.value,
          [0, TIMER_HEIGHT],
          [1, 0],
          'clamp'
        ),
      },
    ],
    opacity: interpolate(
      scrollOffsetAnim.value,
      [0, TIMER_HEIGHT],
      [1, 0],
      'clamp'
    ),
  }));

  const wifiAnimStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollOffsetAnim.value,
          [0, TIMER_HEIGHT],
          [0, -TIMER_HEIGHT],
          'clamp'
        ),
      },
    ],
  }));

  // Set status bar color
  useStatusBarEffect(colors.secondary, 'dark-content', true);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Add refresh logic here
      await new Promise((resolve: any) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error refreshing home data:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollOffsetAnim.value = event.contentOffset.y;
    },
  });

  // Action buttons configuration
  const actionButtons: ActionButtonConfig[] = [
    {
      id: 'redeem',
      label: 'Redeem Points',
      icon: 'gift',
      onPress: () => {
        setActiveButtonId('redeem');
        // Navigate to points screen
      },
    },
    {
      id: 'history',
      label: 'History',
      icon: 'clock',
      onPress: () => {
        setActiveButtonId('history');
        // Navigate to history screen
      },
    },
    {
      id: 'map',
      label: 'Map',
      icon: 'globe',
      onPress: () => {
        setActiveButtonId('map');
        // Navigate to map screen
      },
    },
  ];

  // Discover cards configuration
  const discoverCards: DiscoverCardConfig[] = [
    {
      id: 'promo1',
      type: 'promo',
      title: 'Double points weekend starts now!',
      badge: 'PROMO',
      actionLabel: 'Ends Sunday',
      accentColor: 'green',
      onPress: () => {
        // Handle promo card press
      },
    },
    {
      id: 'news1',
      type: 'news',
      title: 'New WiFi zones added in Downtown.',
      badge: 'NEWS',
      actionLabel: 'See Map',
      accentColor: 'blue',
      onPress: () => {
        // Navigate to map
      },
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <HomeHeader
        userName={userName}
        isOnline={true}
        hasNotification={true}
        onNotificationPress={() => {
          // Handle notification press
        }}
      />

      {/* Confetti Overlay - Full screen, not affected by scroll */}
      {showConfetti && (
        <View style={styles.confettiOverlay}>
          <LottieView
            source={getLoadingAnimation('confetti').source}
            autoPlay
            loop={false}
            style={styles.confettiAnimation}
          />
        </View>
      )}

      {/* Scrollable Content */}
      <Animated.ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl * 2 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        scrollEventThrottle={16}
        onScroll={handleScroll}
      >
        {/* Session Timer - Animates out */}
        <Animated.View style={[styles.timerSection, timerAnimStyle]}
        >
          <SessionTimer
            pointsGained={pointsGained}
            isActive={isSessionActive}
            targetSeconds={3600} // 1 hour
            initialSeconds={0}
            opacityAnim={scrollOffsetAnim}
            onConfettiTrigger={setShowConfetti}
          />
        </Animated.View>

        {/* Current WiFi Card - Becomes sticky */}
        <Animated.View style={[styles.wifiSection, wifiAnimStyle]}
        >
          <CurrentWiFiCard
            onPress={() => {
              // Navigate to WiFi details
            }}
          />
        </Animated.View>

        {/* Action Buttons */}
        <ActionButtons
          buttons={actionButtons}
          activeButtonId={activeButtonId}
        />

        {/* Discover Section */}
        <DiscoverCards
          title="Discover"
          cards={discoverCards}
          onViewAll={() => {
            // Handle view all
          }}
        />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondarySoft,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  timerSection: {
    // paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  wifiSection: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  confettiOverlay: {
    position: 'absolute',
    top: -600,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    pointerEvents: 'none',
  },
  confettiAnimation: {
    width: 150,
    height: 150,
  },
});

export default HomeScreen;
