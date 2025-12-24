import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  PermissionsAndroid
} from 'react-native';
import { NetworkInfo } from 'react-native-network-info';
import { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions';
import { Text } from '@/shared/components';
import { colors, dimensions, spacing, typography } from '@/shared/themes';
import NetInfo from "@react-native-community/netinfo";

NetInfo.configure({
  shouldFetchWiFiSSID: true,
});

interface CurrentWiFiCardProps {
  onPress?: () => void;
}

const getSignalColor = (strength: string): string => {
  switch (strength.toLowerCase()) {
    case 'excellent':
      return colors.primary;
    case 'good':
      return colors.success;
    case 'fair':
      return colors.warning;
    case 'poor':
      return colors.danger;
    default:
      return colors.gray;
  }
};


export const CurrentWiFiCard: React.FC<CurrentWiFiCardProps> = ({
  onPress,
}) => {
  const [ssid, setSsid] = useState<string | null>(null);
  const [bssid, setBssid] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    requestWiFiPermission();
  }, []);

  const requestWiFiPermission = async () => {
    try {
      setIsLoading(true);
      console.log('🔐 Requesting WiFi/Location permissions...');

      // iOS requires LOCATION permission to access WiFi SSID
      // Android requires LOCATION permission to access WiFi details
      const permission = Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

      // Check current permission status
      const currentStatus = await check(permission);
      console.log('📍 Current permission status:', currentStatus);

      if (currentStatus === RESULTS.GRANTED) {
        console.log('✅ Location permission already granted');
        setPermissionGranted(true);
        // await fetchWiFiInfo();
        await getSSID();
      } else {
        // Request permission
        const result = await request(permission);
        console.log('🔐 Permission request result:', result);

        if (result === RESULTS.GRANTED) {
          console.log('✅ Location permission granted');
          setPermissionGranted(true);
          // await fetchWiFiInfo();
          await getSSID();
        } else if (result === RESULTS.DENIED) {
          console.log('❌ Permission denied - retry on next app load');
          setSsid('Permission Required');
          setBssid('Please enable in Settings');
          setPermissionGranted(false);
        } else if (result === RESULTS.BLOCKED) {
          console.log('❌ Permission blocked permanently');
          setSsid('Permission Blocked');
          setBssid('Enable in Settings > Privacy');
          setPermissionGranted(false);
        }
      }
    } catch (error) {
      console.error('❌ Error requesting permission:', error);
      setSsid('Error');
      setBssid('Check permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWiFiInfo = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Fetching WiFi info...');

      const ssidData = await NetworkInfo.getSSID();
      console.log('✅ SSID fetched:', ssidData);

      const bssidData = await NetworkInfo.getBSSID();
      console.log('✅ BSSID fetched:', bssidData);

      setSsid(ssidData);
      setBssid(bssidData);
    } catch (error) {
      console.error('❌ Error fetching WiFi info:', error);
      setSsid('Unknown');
      setBssid('Unknown');
    } finally {
      setIsLoading(false);
    }
  };

  const getSSID = async () => {
  try {
    // 1. Request location permissions first (required for both platforms)
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message: "We need access to your location to get the WiFi name.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Location permission denied, cannot get SSID.");
        return null;
      }
    } else if (Platform.OS === 'ios') {
        // Use an appropriate library like expo-location or a native method to request permissions on iOS
        // await Location.requestForegroundPermissionsAsync(); 
    }

    // 2. Fetch the network state
    const state = await NetInfo.fetch();

    // 3. Access the SSID
    if (state.type === 'wifi' && state.details) {
      console.log("SSID:", state.details.bssid);
      return state.details.bssid;
    } else {
      console.log("Not connected to WiFi or SSID not available.");
      return null;
    }
  } catch (error) {
    console.error("Failed to get network info:", error);
    return null;
  }
};

  const signalColor = getSignalColor('good');
  const wifiName = ssid || 'Loading...';
  const signalStrength = 'Good';

  

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Image
          source={require('@shared/assets/gif/green-planet.gif')}
          style={styles.gif}
        />
      </View>

      <View style={styles.contentSection}>
        <Text style={styles.wifiName}>{wifiName}</Text>
        {bssid && (
          <Text style={styles.bssidText}>
            {bssid}
          </Text>
        )}
        <View style={styles.signalContainer}>
          {isLoading ? (
            <ActivityIndicator size="small" color={signalColor} />
          ) : (
            <>
              <View
                style={[
                  styles.signalDot,
                  { backgroundColor: signalColor },
                ]}
              />
              <Text
                style={[
                  styles.signalText,
                  { color: signalColor },
                ]}
              >
                {signalStrength}
              </Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.speedSection}>
        <Image
          source={require('@shared/assets/mascots/Unitree - Mascot-3.png')}
          style={styles.mascotImage}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: dimensions.radius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginVertical: spacing.md,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: dimensions.radius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  gif: {
    width: 64,
    height: 64,
    borderRadius: dimensions.radius.round,
  },
  contentSection: {
    flex: 1,
    gap: spacing.sm,
  },
  wifiName: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.dark,
  },
  bssidText: {
    ...typography.caption,
    color: colors.gray,
    marginTop: spacing.xs,
    fontSize: 11,
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  signalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  signalText: {
    ...typography.caption,
    fontWeight: '500',
  },
  speedSection: {
    alignItems: 'flex-end',
    gap: spacing.xs,
    marginRight: spacing.lg
  },
  speedValue: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.dark,
  },
  speedUnit: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.gray,
    textTransform: 'uppercase',
    fontSize: 10,
  },
  mascotImage: {
    width: 60,
    height: 60,
  },
});
