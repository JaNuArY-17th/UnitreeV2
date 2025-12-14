import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { QRScan, QR } from '@/shared/assets/icons';
import { colors, spacing, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';
import { useTranslation } from '@/shared/hooks/useTranslation';

interface QRBottomActionsProps {
  onQRPaymentPress?: () => void;
  onScanQRPress?: () => void;
  activeTab?: 'payment' | 'scan';
}

const QRBottomActions: React.FC<QRBottomActionsProps> = ({
  onQRPaymentPress,
  onScanQRPress,
  activeTab = 'payment',
}) => {
  const { t } = useTranslation('payment');
  const navigation = useNavigation();

  const handleQRPaymentPress = () => {
    if (onQRPaymentPress) {
      onQRPaymentPress();
    }
  };

  const handleScanQRPress = () => {
    if (onScanQRPress) {
      onScanQRPress();
    } else {
      // Navigate to ScanQRScreen
      navigation.navigate('ScanQRScreen' as never);
    }
  };

  return (
    <View style={styles.bottomSection}>
      <TouchableOpacity
        style={[
          styles.bottomButton, 
          styles.qrPaymentButton,
          activeTab === 'payment' && styles.activeButton
        ]}
        onPress={handleQRPaymentPress}
        activeOpacity={0.8}
      >
        <View style={styles.scanIcon}>
          <QR 
            width={24} 
            height={24} 
            color={activeTab === 'payment' ? colors.primary : colors.text.secondary} 
          />
        </View>
        <Text style={[
          styles.qrPaymentText,
          activeTab === 'payment' && styles.activeText
        ]}>
          {t('bottomActions.qrPayment')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.bottomButton, 
          styles.scanButton,
          activeTab === 'scan' && styles.activeButton
        ]}
        onPress={handleScanQRPress}
        activeOpacity={0.8}
      >
        <View style={styles.scanIcon}>
          <QRScan 
            width={24} 
            height={24} 
            color={activeTab === 'scan' ? colors.primary : colors.text.secondary} 
          />
        </View>
        <Text style={[
          styles.scanText,
          activeTab === 'scan' && styles.activeText
        ]}>
          {t('bottomActions.scanQR')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomSection: {
    flexDirection: 'row',
    backgroundColor: colors.light,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bottomButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  qrPaymentButton: {
    marginRight: spacing.sm,
  },
  scanButton: {
    marginLeft: spacing.sm,
  },
  qrPaymentIcon: {
    width: 32,
    height: 32,
    marginBottom: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrGrid: {
    width: 24,
    height: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  qrPixel: {
    width: '25%',
    height: '25%',
  },
  qrPaymentText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    textAlign: 'center',
  },
  scanIcon: {
    width: 32,
    height: 32,
    marginBottom: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    textAlign: 'center',
  },
  activeButton: {
    // backgroundColor: colors.primary,
  },
  activeText: {
    color: colors.primary,
  },
});

export default QRBottomActions;