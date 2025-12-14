import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors, spacing, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';

interface QRFooterOverlayProps {
  supportedQRText: string;
  onUploadImage: () => void;
  onPaymentQR: () => void;
  onReceiveQR: () => void;
  uploadText: string;
  paymentQRText: string;
  receiveQRText: string;
}

const QRFooterOverlay: React.FC<QRFooterOverlayProps> = ({
  supportedQRText,
  onUploadImage,
  onPaymentQR,
  onReceiveQR,
  uploadText,
  paymentQRText,
  receiveQRText,
}) => {
  return (
    <View style={styles.footerOverlay}>
      <View style={styles.supportedQR}>
        <Text style={styles.qrType}>{supportedQRText}</Text>
      </View>

      <TouchableOpacity onPress={onUploadImage} style={styles.uploadButton}>
        <View style={styles.uploadIcon}>
          <View style={styles.imageIcon} />
        </View>
        <Text style={styles.uploadText}>{uploadText}</Text>
      </TouchableOpacity>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={onPaymentQR}>
          <View style={styles.qrIcon}>
            <View style={styles.qrPattern}>
              {[...Array(9)].map((_, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.qrPixel, 
                    { backgroundColor: (index % 2 === 0) ? colors.light : 'transparent' }
                  ]} 
                />
              ))}
            </View>
          </View>
          <Text style={styles.actionText}>{paymentQRText}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onReceiveQR}>
          <View style={styles.moneyIcon}>
            <View style={styles.billShape} />
          </View>
          <Text style={styles.actionText}>{receiveQRText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.lg,
    alignItems: 'center',
  },
  supportedQR: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  qrType: {
    color: colors.light,
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  uploadIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  imageIcon: {
    width: 16,
    height: 12,
    backgroundColor: colors.light,
    borderRadius: 2,
  },
  uploadText: {
    color: colors.light,
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    marginHorizontal: spacing.sm,
    borderRadius: 12,
    gap: spacing.sm,
  },
  qrIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrPattern: {
    width: 20,
    height: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  qrPixel: {
    width: '33.33%',
    height: '33.33%',
  },
  moneyIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  billShape: {
    width: 20,
    height: 12,
    backgroundColor: colors.light,
    borderRadius: 2,
  },
  actionText: {
    color: colors.light,
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },
});

export default QRFooterOverlay;