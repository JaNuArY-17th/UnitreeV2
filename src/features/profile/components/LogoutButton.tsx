import React from 'react';
import { StyleSheet, TouchableOpacity, Alert, View } from 'react-native';
import Text from '@/shared/components/base/Text';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Logout01Icon } from '@hugeicons/core-free-icons';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useAuth } from '@/features/authentication/hooks/useAuth';
import { colors, spacing, typography } from '@/shared/themes';
import { apiClient } from '@/shared/utils/axios';
import { API_ENDPOINTS } from '@/shared/config/env';
import { useUserData } from '../hooks/useUserData';
import { useStoreData } from '@/features/authentication/hooks/useStoreData';
import { AutoLoginUtils } from '@/features/authentication/utils/autoLoginUtils';

export const LogoutButton: React.FC = () => {
  const { t } = useTranslation('profile');
  const { logout } = useAuth();
  const { data: userData } = useUserData();
  const { data: storeResponse } = useStoreData();

  const handleLogout = () => {
    Alert.alert(
      t('actions.logout'),
      t('actions.logoutDescription'),
      [
        {
          text: t('actions.cancel'),
          style: 'cancel',
        },
        {
          text: t('actions.logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Determine which name to save based on user type
              const lastUserType = await AutoLoginUtils.getLastUserType();
              console.log('🔍 [LogoutButton] Last user type:', lastUserType);

              if (lastUserType === 'store' && storeResponse?.data?.name) {
                console.log('💾 [LogoutButton] Saving store name for remember login:', storeResponse.data.name);
                await AutoLoginUtils.saveRememberedName(storeResponse.data.name);
              } else if (userData?.full_name) {
                console.log('💾 [LogoutButton] Saving user name for remember login:', userData.full_name);
                await AutoLoginUtils.saveRememberedName(userData.full_name);
              }

              // Call logout API first
              console.log('📤 [LogoutButton] Calling logout API...');
              await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
              console.log('✅ [LogoutButton] Logout API called successfully');
            } catch (apiError) {
              console.warn('⚠️ [LogoutButton] Logout API error (continuing anyway):', apiError);
              // Continue with local logout even if API call fails
            }

            try {
              // Then clear local auth state
              console.log('🔐 [LogoutButton] Clearing local auth state...');
              await logout();
              console.log('✅ [LogoutButton] Local auth state cleared');
            } catch (error) {
              console.error('❌ [LogoutButton] Logout error:', error);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogout}
      >
        <HugeiconsIcon icon={Logout01Icon} size={24} color={colors.danger} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {t('actions.logout')}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light,
    borderRadius: 14,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.lg * 6,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  textContainer: {
    marginLeft: spacing.lg,
    flex: 1,
  },
  title: {
    ...typography.subtitle,
    color: colors.danger,

    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#727272',
  },
});
