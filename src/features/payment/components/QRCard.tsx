import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, dimensions, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';
import { Body } from '@/shared/components/base';
import { Copy, CircleAdd, Edit } from '@/shared/assets/icons';
import { QRActionButtons } from './QRActionButtons';
import QRCode from 'react-native-qrcode-svg';
import { formatVND } from '@/shared/utils/format';

interface QRCardProps {
  userName: string;
  userID: string;
  isLoading: boolean;
  qrDataURL: string | null;
  qrCode?: string; // Fallback QR code string
  amount?: string; // Amount value
  description?: string; // Description/note
  showUserName?: boolean; // Whether to show user name
  showPhoneNumber?: boolean; // Whether to show phone number
  onCopyUserID: () => void;
  onAddAmount: () => void;
  onRefreshQR: () => void;
  onDownload: () => void;
  onCustomize: () => void;
  onShare: () => void;
}

export const QRCard: React.FC<QRCardProps> = ({
  userName,
  userID,
  isLoading,
  qrDataURL,
  qrCode,
  amount,
  description,
  showUserName = true,
  showPhoneNumber = true,
  onCopyUserID,
  onAddAmount,
  onRefreshQR: _onRefreshQR,
  onDownload,
  onCustomize,
  onShare,
}) => {
  const { t } = useTranslation('payment');

  return (
    <View style={styles.qrCard}>
      {/* User Info - Only show if at least one field should be displayed */}
      {(showUserName || showPhoneNumber) && (
        <View style={styles.userInfo}>
          {showUserName && <Body style={styles.userName}>{userName}</Body>}
          {showPhoneNumber && (
            <View style={styles.userIdContainer}>
              <Body style={styles.userId}>{userID}</Body>
              <TouchableOpacity onPress={onCopyUserID} style={styles.copyButton}>
                <Copy width={16} height={16} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* QR Card Content */}
      <View style={styles.qrCardContent}>
        {/* Payment Method Logos */}
        <View style={styles.paymentMethods}>
          <Body style={styles.paymentMethodsText}>
            {t('receiveMoney.paymentMethods', 'Phương thức thanh toán được hỗ trợ')}
          </Body>
        </View>

        {/* QR Code */}
        <View style={styles.qrImageContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Body style={styles.loadingText}>
                {t('receiveMoney.loading', 'Đang tạo mã QR...')}
              </Body>
            </View>
          ) : qrDataURL ? (
            <View style={styles.qrCodeBackground}>
              <Image
                source={{ uri: qrDataURL }}
                style={styles.qrImage}
                resizeMode="contain"
              />
            </View>
          ) : qrCode ? (
            <View style={styles.qrCodeBackground}>
              <QRCode
                size={200}
                value={qrCode}
                backgroundColor={colors.light}
                color={colors.text.primary}
              />
            </View>
          ) : (
            <View style={styles.qrPlaceholder}>
              <Body style={styles.qrPlaceholderText}>
                {t('receiveMoney.noQR', 'Chưa có mã QR')}
              </Body>
            </View>
          )}
        </View>

        {/* Amount and Description Display or Add Amount Button */}
        {amount && amount !== '0' ? (
          <View style={styles.amountDisplayContainer}>
            <TouchableOpacity style={styles.editButton} onPress={onAddAmount}>
              <View style={styles.amountInfo}>
                <View style={styles.amountValueContainer}>
                  <Body style={styles.amountValue}>
                    {formatVND(parseInt(amount, 10))}
                  </Body>
                  <Edit width={20} height={20} color={colors.primary} />
                </View>
                {description && (
                  <Body style={styles.descriptionText}>
                    {description}
                  </Body>
                )}
              </View>

            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.addAmountButton} onPress={onAddAmount}>
            <CircleAdd width={20} height={20} color={colors.primary} />
            <Body style={styles.addAmountText}>
              {t('receiveMoney.addAmount', 'Thêm số tiền')}
            </Body>
          </TouchableOpacity>
        )}
      </View>

      {/* Action Buttons */}
      <QRActionButtons
        onDownload={onDownload}
        onCustomize={onCustomize}
        onShare={onShare}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  qrCard: {
    margin: spacing.lg,
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.lg,
    overflow: 'hidden',
  },
  userInfo: {
    alignItems: 'center',
    paddingTop: spacing.lg,

  },
  userName: {
    fontSize: 20,

    color: colors.text.primary,
    paddingTop: spacing.sm,
    lineHeight: 28
  },
  copyButton: {
    padding: spacing.xs,
    borderRadius: dimensions.radius.sm,
  },
  userIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  userId: {
    fontSize: 15,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
    marginRight: spacing.sm,
  },
  qrCardContent: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
    paddingTop: spacing.lg,
  },
  paymentMethods: {
    marginBottom: spacing.sm,
    width: '70%',
    alignItems: 'center',
  },
  paymentMethodsText: {
    fontSize: 13,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
    textAlign: 'center',
  },
  qrImageContainer: {
    width: 230,
    height: 230,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: spacing.md,
  },
  qrPlaceholder: {
    width: 220,
    height: 220,
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  qrCodeBackground: {
    width: 240,
    height: 240,
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  qrImage: {
    width: 230,
    height: 230,
  },
  qrPlaceholderText: {
    color: colors.text.secondary,
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 220,
    width: 220,
  },
  loadingText: {
    color: colors.text.secondary,
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    marginTop: spacing.md,
  },
  refreshButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.round,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  refreshText: {
    fontSize: 16,
    color: colors.primary,

  },
  centerLogo: {
    position: 'absolute',
    width: 50,
    height: 50,
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.round,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  centerLogoText: {
    fontSize: 12,

    color: colors.primary,
  },
  addAmountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  addAmountText: {
    color: colors.primary,
    marginLeft: spacing.sm,
    fontSize: 16,

  },
  amountDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  amountValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  amountInfo: {
    flex: 1,
    alignItems: 'center',
  },
  amountValue: {
    fontSize: 20,

    color: colors.primary,
  },
  descriptionText: {
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
  },
});
