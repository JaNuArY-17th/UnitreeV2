import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import Text from '@/shared/components/base/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '@/shared/components/ScreenHeader';
import Button from '@/shared/components/base/Button';
import PhoneInput from '../components/LoginScreen/PhoneInput';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, spacing, dimensions, typography } from '@/shared/themes';
import { KeyboardDismissWrapper } from '@/shared/components/base';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
interface ForgotPasswordScreenProps {
  onContinue?: (phone: string) => void;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onContinue,
}) => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | undefined>(undefined);
  const [touched, setTouched] = useState(false);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleBackPress = () => {
    navigation.navigate('Login');
  }

  // Validate phone number
  const validatePhone = (phoneNumber: string): string | undefined => {
    if (!phoneNumber || phoneNumber.trim() === '') {
      return 'Vui lòng nhập số điện thoại';
    }
    // Remove non-digits to validate
    const phoneDigits = phoneNumber.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      return 'Số điện thoại không hợp lệ';
    }
    return undefined;
  };

  const handlePhoneChange = (text: string) => {
    setPhone(text);
    // Clear error when user starts typing
    if (phoneError) {
      setPhoneError(undefined);
    }
  };

  const handlePhoneBlur = () => {
    setTouched(true);
    const error = validatePhone(phone);
    setPhoneError(error);
  };

  const isPhoneValid = () => {
    return validatePhone(phone) === undefined;
  };

  const handleContinue = async () => {
    // Mark as touched to show validation errors
    setTouched(true);

    // Validate phone
    const error = validatePhone(phone);
    setPhoneError(error);

    if (error) {
      return; // Don't proceed if validation fails
    }

    if (onContinue) {
      onContinue(phone);
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement forgot password API call
      console.log('Sending OTP to phone:', phone);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Navigate to OTP verification screen
      navigation.navigate('ForgotPasswordOtp', { phone });
    } catch (error) {
      console.error('Failed to send OTP:', error);
      // TODO: Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = !isPhoneValid() || isLoading;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* <BackgroundPattern /> */}
        <StatusBar barStyle="dark-content" backgroundColor='transparent' />

        <KeyboardDismissWrapper style={styles.container}>
          <ScreenHeader
            title={t('login:forgotPassword')}
            showBack={true}
            centerTitle={false}
            onBackPress={handleBackPress}
          />

          <View style={styles.content}>
            <View style={{ marginBottom: spacing.sm, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={styles.subtitle}>
                {t('forgotPassword:instruction')}
              </Text>
            </View>

            <PhoneInput
              value={phone}
              onChangeText={handlePhoneChange}
              onBlur={handlePhoneBlur}
              error={touched ? phoneError : undefined}
            />

            <Button
              label={t('forgotPassword:button.continue')}
              onPress={handleContinue}
              disabled={isButtonDisabled}
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
            />
          </View>
        </KeyboardDismissWrapper>
      </View>
    </KeyboardAvoidingView>
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
    paddingTop: spacing.sm,
    gap: spacing.md,
    // justifyContent: 'space-between',
  },
  inputSection: {
    // paddingTop: spacing.xl,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    width: '80%',
    lineHeight: 22,
  },
  buttonSection: {
    // paddingBottom: spacing.lg,
  },
});

export default ForgotPasswordScreen;
