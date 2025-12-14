import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import Text from '@/shared/components/base/Text';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '@/shared/components/ScreenHeader';
import Button from '@/shared/components/base/Button';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, spacing, dimensions } from '@/shared/themes';
import { KeyboardDismissWrapper } from '@/shared/components/base';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { useUserData } from '../hooks/useUserData';

const ProfileResetPasswordScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const { t: profileT } = useTranslation('profile');
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data: userData } = useUserData();

  const handleBackPress = () => {
    navigation.goBack();
  };

  // Format phone number for display
  const formatPhoneNumber = (phone: string | null | undefined) => {
    if (!phone) return '--';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('84') && cleaned.length >= 11) {
      const countryCode = '+84';
      const number = cleaned.substring(2);
      return `${countryCode} ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
    }
    return phone;
  };

  const handleContinue = async () => {
    if (!userData?.phone_number) {
      // TODO: Show error toast
      console.error('No phone number available');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement reset password API call
      console.log('Sending reset password OTP to phone:', userData.phone_number);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to OTP verification screen
      navigation.navigate('ProfileResetPasswordOtp', { phone: userData.phone_number });
    } catch (error) {
      console.error('Failed to send OTP:', error);
      // TODO: Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = !userData?.phone_number || isLoading;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor='transparent' />

      <KeyboardDismissWrapper style={styles.container}>
        <ScreenHeader
          title={profileT('resetPassword.title')}
          showBack={true}
          centerTitle={false}
          onBackPress={handleBackPress}
        />

        <View style={styles.content}>
          <View style={styles.infoSection}>
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>
                {profileT('resetPassword.profileInstruction')}
              </Text>
            </View>

            <View style={styles.phoneDisplayContainer}>
              <Text style={styles.phoneLabel}>
                {profileT('resetPassword.phoneNumber')}
              </Text>
              <View style={styles.phoneDisplay}>
                <Text style={styles.phoneNumber}>
                  {formatPhoneNumber(userData?.phone_number)}
                </Text>
              </View>
              <Text style={styles.phoneNote}>
                {profileT('resetPassword.phoneNote')}
              </Text>
            </View>
          </View>

          <View style={styles.buttonSection}>
            <Button
              label={profileT('resetPassword.button.continue')}
              onPress={handleContinue}
              disabled={isButtonDisabled}
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              style={styles.continueButton}
            />
          </View>
        </View>
      </KeyboardDismissWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  infoSection: {
    flex: 1,
    paddingTop: spacing.xl,
  },
  instructionContainer: {
    marginBottom: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionText: {
    color: colors.text.primary,
    fontSize: dimensions.fontSize.lg,
    textAlign: 'center',
    lineHeight: dimensions.fontSize.lg * 1.4,
  },
  phoneDisplayContainer: {
    marginTop: spacing.xl,
  },
  phoneLabel: {
    fontSize: dimensions.fontSize.md,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  phoneDisplay: {
    backgroundColor: colors.lightGray,
    borderRadius: dimensions.radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  phoneNumber: {
    fontSize: dimensions.fontSize.lg,
    color: colors.text.primary,
    textAlign: 'center',
  },
  phoneNote: {
    fontSize: dimensions.fontSize.sm,
    color: colors.gray,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  buttonSection: {
    paddingBottom: spacing.xl,
  },
  continueButton: {
    marginTop: spacing.lg,
  },
});

export default ProfileResetPasswordScreen;