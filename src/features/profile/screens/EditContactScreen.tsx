import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, Alert, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, FONT_WEIGHTS, getFontFamily, spacing } from '@/shared/themes';
import ScreenHeader from '@/shared/components/ScreenHeader';
import Button from '@/shared/components/base/Button';
import Text from '@/shared/components/base/Text';
import { Input, KeyboardDismissWrapper } from '@/shared/components/base';
import { useUpdatePhoneNumber, useUpdateEmail } from '../hooks/useProfileMutations';
import type { RootStackParamList } from '@/navigation/types';
import { useStatusBarEffect } from '../../../shared/utils/StatusBarManager';
import { CallCalling, Phone, SmsTracking } from '../../../shared/assets';

// Route params: { mode: 'phone' | 'email' }
type EditContactRouteProp = RouteProp<RootStackParamList, 'EditContact'>;

const EditContactScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<EditContactRouteProp>();
  const { t } = useTranslation('profile');
  const insets = useSafeAreaInsets();
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mode = route.params?.mode || 'phone';

  const mutation = mode === 'phone' ? useUpdatePhoneNumber() : useUpdateEmail();

  const handleContinue = async () => {
    setError(null);
    setIsLoading(true);
    try {
      if (mode === 'phone') {
        const phoneUpdate = mutation as ReturnType<typeof useUpdatePhoneNumber>;
        await phoneUpdate.mutateAsync({ phone_number: value });
        navigation.navigate('EditContactOtp', { mode, value });
      } else {
        const emailUpdate = mutation as ReturnType<typeof useUpdateEmail>;
        await emailUpdate.mutateAsync({ email: value });
        navigation.navigate('EditContactOtp', { mode, value });
      }
    } catch (e: any) {
      setError(e?.message || t('error.unknown'));
    } finally {
      setIsLoading(false);
    }
  };

  useStatusBarEffect('transparent', 'dark-content', true);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      <ScreenHeader title={mode === 'phone' ? t('editPhone.title') : t('editEmail.title')} showBack />
      <KeyboardDismissWrapper style={styles.content}>
        <Text style={styles.description}>{mode === 'phone' ? t('editPhone.description') : t('editEmail.description')}</Text>
        <View style={styles.inputContainer}>
          {/* Replace with your Input component */}
          <Text style={styles.label}>{mode === 'phone' ? t('editPhone.label') : t('editEmail.label')}</Text>
          <Input
            containerStyle={styles.input}
            value={value}
            onChangeText={setValue}
            placeholder={mode === 'phone' ? t('editPhone.label') : t('editEmail.label')}
            keyboardType={mode === 'phone' ? 'phone-pad' : 'email-address'}
            autoCapitalize={mode === 'email' ? 'none' : 'sentences'}
            leftAdornment={mode === 'phone' ? <CallCalling width={28} height={28} color={colors.primary} /> : <SmsTracking width={28} height={28} color={colors.primary} />}
            autoCorrect={false}
            editable={!isLoading}
          />
        </View>
        {error && <Text style={styles.error}>{error}</Text>}
        <Button
          label={t('continue')}
          onPress={handleContinue}
          loading={isLoading}
          disabled={!value || isLoading}
          style={styles.button}
          size='lg'
        />
      </KeyboardDismissWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  label: {
    fontSize: 16,

    marginBottom: spacing.md,
  },
  description: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  input: {
    // fontSize: 16,
    // borderWidth: 1,
    // borderColor: colors.border,
    // borderRadius: 8,
    // padding: spacing.md,
    // paddingVertical: spacing.lg,
    // backgroundColor: colors.light,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.md,
  },
  button: {
    // marginTop: spacing.lg,
  },
});

export default EditContactScreen;
