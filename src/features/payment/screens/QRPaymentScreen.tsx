import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Text,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackgroundPatternSolid, ScreenHeader } from '@/shared/components';
import { colors, spacing, dimensions } from '@/shared/themes';
import typographyStyles from '@/shared/themes/typography';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useNavigation } from '@react-navigation/native';
import {
  QRCodeDisplay,
  AccountSelector,
  QRReceiveAction,
  QRBottomActions,
} from '../components';
import type { Account, QRPaymentData } from '../types';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';
import { useQRPayment } from '../hooks/useQRPayment';
import { Download, ExportIcon } from '../../../shared/assets';
import ViewShot from 'react-native-view-shot';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';

interface QRPaymentScreenProps {
  hideBottomActions?: boolean;
}

const QRPaymentScreen: React.FC<QRPaymentScreenProps> = ({ hideBottomActions = false }) => {
  const { t } = useTranslation('payment');
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const hasInitializedRef = useRef(false);
  const updateCountdownRef = useRef<((countdown: number) => void) | null>(null);
  const refreshQRRef = useRef<(() => Promise<any>) | null>(null);
  const viewShotRef = useRef<ViewShot>(null);

  // Use the QR payment hook
  const {
    qrData,
    countdown,
    isGenerating,
    isError,
    error,
    generateQR,
    refreshQR,
    updateCountdown,
  } = useQRPayment();

  // Update refs when functions change
  useEffect(() => {
    updateCountdownRef.current = updateCountdown;
    refreshQRRef.current = refreshQR;
  });

  // Generate initial QR code when component mounts - only once
  useEffect(() => {
    if (!hasInitializedRef.current) {
      console.log('🎯 [QRPaymentScreen] Initializing QR generation...');
      hasInitializedRef.current = true;
      generateQR(); // Use default values from hook: amount = 0, description = undefined
    }
  }, []); // Empty dependencies array - only run once on mount

  // Auto-refresh countdown timer - removed auto-refresh functionality
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        updateCountdownRef.current?.(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
    // Note: Removed auto-refresh when countdown reaches 0
  }, [countdown, qrData]); // Stable dependencies

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 [QRPaymentScreen] Cleaning up...');
      hasInitializedRef.current = false;
    };
  }, []);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleQRRefresh = useCallback(() => {
    refreshQR();
  }, [refreshQR]);

  const handlePromotionPress = useCallback(() => {
    // Navigate to promotions or show promotion modal
    console.log('Promotion pressed');
  }, []);

  const handleQRScanPress = useCallback(() => {
    // Navigate to ScanQRScreen directly
    navigation.navigate('ScanQRScreen' as never);
  }, [navigation]);

  const captureScreen = async (): Promise<string | null> => {
    try {
      if (!viewShotRef.current?.capture) {
        Alert.alert('Error', 'Unable to capture screen');
        return null;
      }

      const uri = await viewShotRef.current.capture();
      console.log('📸 [QRPaymentScreen] Screen captured:', uri);
      return uri;
    } catch (error) {
      console.error('❌ [QRPaymentScreen] Screen capture failed:', error);
      Alert.alert('Error', 'Failed to capture screen');
      return null;
    }
  };

  const handleDownload = useCallback(async () => {
    try {
      const imageUri = await captureScreen();
      if (!imageUri) return;

      // Save to photo library using CameraRoll
      const result = await CameraRoll.save(imageUri, {
        type: 'photo',
        album: 'ENSOGO ESPay',
      });

      Alert.alert(
        t('download.success', 'Thành công'),
        t('download.savedToLibrary', 'QR code đã được lưu vào thư viện ảnh')
      );

      console.log('💾 [QRPaymentScreen] QR code saved to photo library:', result);
    } catch (error) {
      console.error('❌ [QRPaymentScreen] Download failed:', error);
      Alert.alert('Error', 'Failed to save QR code to photo library');
    }
  }, [t]);

  useStatusBarEffect('transparent', 'light-content', true);

  return (
    <View style={styles.outerContainer}>
      <ViewShot
        ref={viewShotRef}
        options={{
          format: 'png',
          quality: 1,
          result: 'tmpfile',
        }}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <StatusBar barStyle="light-content" backgroundColor='transparent' />
        <BackgroundPatternSolid backgroundColor={colors.primary} patternColor={colors.light} />

        {/* Header */}
        <ScreenHeader
          title={t('screen.title')}
          showBack={true}
          onBackPress={handleBack}
          backIconColor={colors.light}
          titleStyle={{ color: colors.light }}
          actions={[
            {
              key: 'download',
              icon: <ExportIcon width={24} height={24} color={colors.light} />,
              onPress: handleDownload,
            }
          ]}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false} // Disable scrolling, content fits screen
        >
          {/* QR Code Display - always show, with internal loading state */}
          <QRCodeDisplay
            qrData={qrData}
            isLoading={isGenerating}
            onRefresh={handleQRRefresh}
            onPromotionPress={handlePromotionPress}
          />

          {/* QR Receive Action */}
          {/* <QRReceiveAction /> */}
        </ScrollView>
      </ViewShot>

      {/* Bottom Actions - Outside ViewShot to exclude from screenshot */}
      {!hideBottomActions && (
        <QRBottomActions
          onScanQRPress={handleQRScanPress}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl * 2,
  },
  errorContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.dangerSoft,
    borderRadius: dimensions.radius.lg,
  },
  errorText: {
    ...typographyStyles.bodySmall,
    color: colors.danger,
    textAlign: 'center',
  },
});

export default QRPaymentScreen;
