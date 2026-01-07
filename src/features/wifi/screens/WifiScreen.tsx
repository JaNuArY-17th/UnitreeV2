import React, { useCallback } from 'react';
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
  RecentSessions,
} from '../components';
import { useStatusBarEffect } from '@/shared/utils/StatusBarManager';

const WifiScreen = () => {
  const insets = useSafeAreaInsets();

  // State management
  const [timeConnected] = React.useState('01:45:23');
  const [connectedNetwork] = React.useState('Home_Network_5G');
  const [totalTime] = React.useState('3h 12m');
  const [signalStrength] = React.useState('Excellent');
  const [pointsEarned] = React.useState(105);
  const [isActive] = React.useState(true);

  useStatusBarEffect(colors.secondary, 'dark-content', true);


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
      {/* <WifiHeader 
        onWifiPress={handleWifiPress}
        onSettingsPress={handleSettingsPress}
      /> */}

      {/* Content */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >


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

        {/* Recent Sessions */}
        <RecentSessions />
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
    paddingTop: spacing.lg,
  },
});

export default WifiScreen;
