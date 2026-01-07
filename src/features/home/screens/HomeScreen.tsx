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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStatusBarEffect } from '@/shared/utils/StatusBarManager';
import { spacing, colors } from '@/shared/themes';
import {
  HomeHeader,
  CurrentWiFiCard,
  ActionButtons,
  ActionButtonConfig,
  DiscoverCards,
  DiscoverCardConfig,
} from '../components';
import { AnimatedWaterCircle, RecentSessions } from '@/features/wifi/components';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TIMER_HEIGHT = 280; // Increased height for AnimatedWaterCircle
const WIFI_CARD_HEIGHT = 100; // Approximate height
const HOMEHEADER_HEIGHT = 130; // Height of HomeHeader (includes safe area)

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const scrollViewRef = React.useRef<Animated.ScrollView>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('Alex');
  const [pointsGained, setPointsGained] = useState(2450);
  const [wifiName, setWifiName] = useState('Starbucks_5G');
  const [signalStrength, setSignalStrength] = useState<'Excellent' | 'Good' | 'Fair' | 'Poor'>('Excellent');
  const [wifiSpeed, setWifiSpeed] = useState(120);
  const [activeButtonId, setActiveButtonId] = useState('redeem');
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [timeConnected, setTimeConnected] = useState('01:45:23');
  const [elapsedSeconds, setElapsedSeconds] = useState(0); // Synchronized timer state

  // Scroll animation values
  const scrollOffsetAnim = useSharedValue(0);

  // Animation styles for scroll-driven animations
  const timerAnimStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollOffsetAnim.value,
      [0, TIMER_HEIGHT],
      [1, 0.1],
      'clamp'
    );
    const opacity = interpolate(
      scrollOffsetAnim.value,
      [0, TIMER_HEIGHT * 0.8, TIMER_HEIGHT],
      [1, 0.3, 0],
      'clamp'
    );
    return {
      transform: [{ scale }],
      opacity,
    };
  });

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
    }
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

      {/* Scrollable Content */}
      <Animated.ScrollView
        ref={scrollViewRef}
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl * 3 },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        stickyHeaderIndices={[1]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Animated Water Circle - Collapse and fade out */}
        <Animated.View style={[styles.timerSection, timerAnimStyle]}>
          <AnimatedWaterCircle
            timeDisplay={timeConnected}
            isActive={isSessionActive}
            elapsedSeconds={elapsedSeconds}
            pointsGained={pointsGained}
          />
        </Animated.View>

        {/* Current WiFi Card */}
        <View style={styles.wifiCardWrapper}>
          <CurrentWiFiCard
            onPress={() => {
              // Navigate to WiFi details
            }}
            pointsGained={pointsGained}
            isSessionActive={isSessionActive}
            elapsedSeconds={elapsedSeconds}
            scrollOffsetAnim={scrollOffsetAnim}
            onTimerElapsedChange={setElapsedSeconds}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.contentSection}>
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

          <RecentSessions />
        </View>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  wifiCardWrapper: {
    // paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.secondarySoft,
  },
  contentSection: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  wifiSection: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    width: '100%',
  },
  wifiStickySection: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    width: '100%',
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
  }
});

export default HomeScreen;
