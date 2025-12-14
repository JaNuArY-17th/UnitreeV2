import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/shared/hooks/useTranslation';
import OtpVerificationScreen from '@/shared/screens/OtpVerificationScreen';
import { useVerifyUpdatePhoneNumber, useVerifyUpdateEmail, useResendUpdatePhoneNumber, useResendUpdateEmail } from '../hooks/useProfileMutations';
import { USER_QUERY_KEYS } from '../hooks/useUserData';
import type { RootStackParamList } from '@/navigation/types';

// Route params: { mode: 'phone' | 'email', value: string }
type EditContactOtpRouteProp = RouteProp<RootStackParamList, 'EditContactOtp'>;


const EditContactOtpScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<EditContactOtpRouteProp>();
    const queryClient = useQueryClient();
    const { t } = useTranslation('profile');
    // const { t: profileT } = useTranslation('profile');
    const { mode, value } = route.params;
    const [isLoading, setIsLoading] = useState(false);

    const verifyPhoneMutation = useVerifyUpdatePhoneNumber();
    const verifyEmailMutation = useVerifyUpdateEmail();
    const resendPhoneMutation = useResendUpdatePhoneNumber();
    const resendEmailMutation = useResendUpdateEmail();

    const handleVerify = async (otp: string) => {
        setIsLoading(true);
        try {
            if (mode === 'phone') {
                await verifyPhoneMutation.mutateAsync({ otp });
            } else {
                await verifyEmailMutation.mutateAsync({ otp });
            }
            // Invalidate user data cache in background
            queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.userData });
            // Hiển thị alert thành công
            Alert.alert(
                t('success.title'),
                mode === 'phone' ? t('success.phone') : t('success.email'),
                [
                    {
                        text: t('ok'),
                        onPress: () => {
                if (navigation.canGoBack()) {
                navigation.pop(2);
            } else {
                navigation.navigate('UserDetail');
            }                        }
                    }
                ]
            );
        } catch (e: any) {
            setIsLoading(false);
            throw new Error(e?.message || t('error.unknown'));
        }
        setIsLoading(false);
    };

    const handleResend = async () => {
        if (mode === 'phone') {
            await resendPhoneMutation.mutateAsync();
        } else {
            await resendEmailMutation.mutateAsync();
        }
        Alert.alert(t('otp.resendSuccess'));
    };

    const handleSuccessOk = () => {
        // Use setTimeout to ensure modal closes before navigation
        setTimeout(() => {
            // Pop 2 screens: EditContactOtp and EditContact
            // This will go back to UserDetail without these screens in the stack
            if (navigation.canGoBack()) {
                navigation.pop(2);
            } else {
                navigation.navigate('UserDetail');
            }
        }, 100);
    };

    return (
        <>
            <OtpVerificationScreen
                title={t('otp.title')}
                subtitle={mode === 'phone' ? t('otp.phoneDescription', { value }) : t('otp.emailDescription', { value })}
                onVerify={handleVerify}
                onResend={handleResend}
                loading={isLoading}
                resendText={t('resetPassword.otp.resendText')}
                resendButtonText={t('resetPassword.otp.resendButton')}
                resendButtonDisabledText={t('resetPassword.otp.resendDisabled')}
                codeLength={6}
                resendSeconds={60}
            />

        </>
    );
};




export default EditContactOtpScreen;
