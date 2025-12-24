import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, colors } from '@/shared/themes';
import {
  WifiHeader,
  AnimatedWaterCircle,
  ConnectedNetwork,
  TwoStatsCards,
  PointsRedeemBar,
} from '../components';

const WifiScreen = () => {
  const insets = useSafeAreaInsets();

  // State management
  const [timeConnected] = useState('01:45:23');
  const [connectedNetwork] = useState('Home_Network_5G');
  const [totalTime] = useState('3h 12m');
  const [signalStrength] = useState('Excellent');
  const [pointsEarned] = useState(105);
  const [isActive] = useState(true);

  const handleWifiPress = useCallback(() => {
    Alert.alert('WiFi', 'WiFi settings');
  }, []);

  const handleSettingsPress = useCallback(() => {
    Alert.alert('Settings', 'Open settings');
  }, []);

  const handleRedeemPress = useCallback(() => {
    Alert.alert('Redeem Points', `You have ${pointsEarned} points to redeem!`);
  }, [pointsEarned]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <WifiHeader 
        onWifiPress={handleWifiPress}
        onSettingsPress={handleSettingsPress}
      />

      {/* Content */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Animated Water Circle */}
        <View style={styles.circleWrapper}>
          <AnimatedWaterCircle 
            timeDisplay={timeConnected}
            isActive={isActive}
          />
        </View>

        {/* Connected Network */}
        <ConnectedNetwork 
          networkName={connectedNetwork}
          isConnected={true}
        />

        {/* Two Stats Cards */}
        <TwoStatsCards
          totalTime={totalTime}
          signalStrength={signalStrength}
        />

        {/* Points Redeem Bar */}
        <PointsRedeemBar
          points={pointsEarned}
          onRedeemPress={handleRedeemPress}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  circleWrapper: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
});

export default WifiScreen;
