import { useEffect, useState, useCallback } from 'react';
import { requestWiFiPermission, getWifiInfo, WifiInfo } from '../services/wifiService';

interface UseWifiInfoResult {
  ssid: string | null;
  bssid: string | null;
  signalLevel?: number;
  isLoading: boolean;
  permissionGranted: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * React hook for managing WiFi information
 * Handles permission requests and WiFi info fetching
 */
export const useWifiInfo = (autoFetch: boolean = true): UseWifiInfoResult => {
  const [ssid, setSsid] = useState<string | null>(null);
  const [bssid, setBssid] = useState<string | null>(null);
  const [signalLevel, setSignalLevel] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWifiInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Request permission first
      const permissionResult = await requestWiFiPermission();
      setPermissionGranted(permissionResult.granted);

      if (!permissionResult.granted) {
        setSsid('Permission Required');
        setBssid(permissionResult.message || 'Enable in Settings');
        setError(permissionResult.message || 'Permission not granted');
        return;
      }

      // Fetch WiFi info
      const wifiData: WifiInfo = await getWifiInfo();

      if (wifiData.ssid) {
        setSsid(wifiData.ssid);
        setBssid(wifiData.bssid);
        setSignalLevel(wifiData.level);
      } else {
        setSsid('Not Connected');
        setBssid('Enable WiFi');
        setError('Not connected to WiFi');
      }
    } catch (err) {
      console.error('❌ Error in useWifiInfo:', err);
      setSsid('Error');
      setBssid('Try again');
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchWifiInfo();
    }
  }, [autoFetch, fetchWifiInfo]);

  return {
    ssid,
    bssid,
    signalLevel,
    isLoading,
    permissionGranted,
    error,
    refetch: fetchWifiInfo,
  };
};
