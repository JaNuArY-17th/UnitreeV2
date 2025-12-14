
import React from 'react';
import { View, StyleSheet, Dimensions, StatusBar, StatusBarStyle } from 'react-native';
import Text from '@/shared/components/base/Text';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { colors, FONT_WEIGHTS, getFontFamily, dimensions, typography } from '@/shared/themes';
import { useVerificationStatus } from '../../features/authentication/hooks/useVerificationStatus';
import Button from '@/shared/components/base/Button';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ID, FileText } from '@/shared/assets';
import { useStatusBarEffect } from '../utils/StatusBarManager';


interface VerificationRequiredOverlayProps {
  children?: React.ReactNode;
}


const VerificationRequiredOverlay: React.FC<VerificationRequiredOverlayProps> = ({ children }) => {
  const { t } = useTranslation('verification');
  const navigation = useNavigation();
  const { verificationStatus } = useVerificationStatus();
  const insets = useSafeAreaInsets();

  // Set status bar based on verification status
  const statusBarBg = verificationStatus === 'VERIFIED' ? 'transparent' : colors.primary;
  const statusBarStyle: StatusBarStyle = 'dark-content';
  const statusBarTranslucent = true;
  useStatusBarEffect(statusBarBg, statusBarStyle, statusBarTranslucent);

  // If VERIFIED, render children (or nothing if no children)
  if (verificationStatus === 'VERIFIED') {
    return <>{children}</>;
  }

  // Overlay as a full screen, with status bar and header (back only)
  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };


  let title = '';
  let message = '';
  let buttonLabel = '';
  let buttonAction: () => void = () => { };
  let IconComponent: React.ReactNode = null;

  if (verificationStatus === 'CARD_VERIFIED') {
    title = t('verification.contract_signing_required', 'Ký hợp đồng dịch vụ');
    message = t('verification.contract_signing_required_description', 'Vui lòng ký hợp đồng sử dụng dịch vụ ENSOGO để tiếp tục.');
    buttonLabel = t('verification.sign_contract', 'Ký hợp đồng');
    buttonAction = () => navigation.navigate('EcontractSigning' as never);
    IconComponent = <FileText width={52} height={52} color={colors.primary} />;
  } else if (verificationStatus === 'NOT_VERIFIED') {
    title = t('verification.ekyc_required');
    message = t('verification.ekyc_required_description');
    buttonLabel = t('verification.complete_ekyc');
    buttonAction = () => navigation.navigate('Ekyc' as never);
    IconComponent = <ID width={52} height={52} />;
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <ScreenHeader
        title=""
        showBack={true}
        onBackPress={handleGoBack}
        containerStyle={styles.header}
      />
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          {IconComponent}
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <Button
          style={styles.button}
          label={buttonLabel}
          onPress={buttonAction}
          testID="verify-action"
          size="lg"
        />
      </View>
    </View>
  );
};




const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.light,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    backgroundColor: colors.light,
    elevation: 0,
    borderBottomWidth: 0,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: dimensions.spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 193, 7, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: dimensions.spacing.lg,
  },
  title: {
    ...typography.h1,
    fontSize: 24,
    color: colors.text.primary,
    marginBottom: dimensions.spacing.sm,
    textAlign: 'center',
    paddingVertical: dimensions.spacing.lg,
  },
  message: {
    ...typography.subtitle,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: dimensions.spacing.xl,
    lineHeight: 22,
    paddingHorizontal: dimensions.spacing.md,
  },
  button: {
    width: '100%',
    marginBottom: dimensions.spacing.md,
    marginTop: dimensions.spacing.lg,
  },
});

export default VerificationRequiredOverlay;
