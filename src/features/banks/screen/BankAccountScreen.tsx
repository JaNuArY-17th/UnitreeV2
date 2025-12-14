import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';
import { colors, spacing, typography } from '@/shared/themes';
import { Heading, Text, Button, BackgroundPattern } from '@/shared/components/base';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation';
import { useBank } from '../hooks/useBank';
import { formatVND } from '@/shared/utils/format';
import { MenuSection } from '@/features/profile/components/MenuSection';
import { CreditCard, Profile, InfoIcon, CheckCircle, Close } from '@/shared/assets/icons';
import { getUserTypeColor } from '@/shared/themes/colors';
import { useQueryClient } from '@tanstack/react-query';
import { userProfileQueryKeys } from '@/features/authentication/hooks/useUserProfile';
import { STORE_QUERY_KEYS } from '@/features/authentication/hooks/useStoreData';

type BankAccountScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const BankAccountScreen: React.FC = () => {
  const navigation = useNavigation<BankAccountScreenNavigationProp>();
  const { t } = useTranslation('banks');
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  useEffect(() => {
    // First, choose account number, then load bank account
    const init = async () => {
      try {
        await chooseAccountNumber();
      } catch (err) {
        // Optionally handle error, but continue to load account
        console.warn('Failed to choose account number:', err);
      }
      loadBankAccount();
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadBankAccount = async () => {
    try {
      await getMyBankAccount();
    } catch (err: any) {
      console.error('Failed to load bank account:', err);
      Alert.alert(
        'Lỗi',
        'Không thể tải thông tin tài khoản ngân hàng. Vui lòng thử lại.',
        [{ text: 'OK' }]
      );
    }
  };

  const {
    bankAccount,
    isLoading,
    error,
    getMyBankAccount,
    clearBankErrors,
    chooseAccountNumber,
  } = useBank();
  const handleRefresh = () => {
    clearBankErrors();
    loadBankAccount();
  };

  const handleRetry = () => {
    clearBankErrors();
    loadBankAccount();
  };

  const handleNavigateToEcontract = () => {
    navigation.navigate('EcontractSigning');
  };

  const handleGoBack = async () => {
    // Invalidate user and store queries before going back to ensure HomeScreen has fresh data
    console.log('🔄 [BankAccount] Invalidating queries before navigating back...');
    await queryClient.invalidateQueries({
      queryKey: userProfileQueryKeys.all,
      refetchType: 'active'
    });
    await queryClient.invalidateQueries({
      queryKey: STORE_QUERY_KEYS.all,
      refetchType: 'active'
    });
    console.log('✅ [BankAccount] Queries invalidated, navigating back');
    navigation.goBack();
  };

  const getAccountMenuItems = () => {
    if (!bankAccount) return [];

    return [
      {
        id: 'accountNumber',
        title: bankAccount.bankNumber,
        subtitle: t('screen.accountNumber'),
        icon: <CreditCard width={28} height={28} color={colors.primary} />,
        onPress: () => { },
        showArrow: false,
      },
      {
        id: 'accountHolder',
        title: bankAccount.bankHolder,
        subtitle: t('screen.accountHolder'),
        icon: <Profile width={28} height={28} color={colors.primary} />,
        onPress: () => { },
        showArrow: false,
      },
      {
        id: 'accountType',
        title: bankAccount.bankType === 'STORE' ? t('screen.store') : t('screen.user'),
        subtitle: t('screen.accountType'),
        icon: <InfoIcon width={28} height={28} color={colors.primary} />,
        onPress: () => { },
        showArrow: false,
      },
    ];
  };

  const renderBankAccountInfo = () => {
    if (!bankAccount) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {t('screen.empty')}
          </Text>
          <Button
            label={t('screen.reload')}
            onPress={handleRetry}
            style={styles.retryButton}
          />
        </View>
      );
    }

    return (
      <View style={styles.accountContainer}>
        <MenuSection
          title={t('screen.accountInfo')}
          items={getAccountMenuItems()}
        />

        {/* Econtract Section */}
        <View style={styles.econtractSection}>
          <Heading style={styles.sectionTitle}>
            {t('screen.econtractSectionTitle')}
          </Heading>
          <Text style={styles.sectionDescription}>
            {t('screen.econtractSectionDesc')}
          </Text>
          <Button
            label={t('screen.econtractButton')}
            onPress={handleNavigateToEcontract}
            style={[styles.econtractButton, { backgroundColor: getUserTypeColor() }]}
            size="md"
          />
        </View>
      </View>
    );
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {typeof error === 'string' ? error : t('screen.error')}
        </Text>
        <Button
          label={t('screen.retry')}
          onPress={handleRetry}
          style={styles.retryButton}
          size='lg'
        />
      </View>
    );
  };

  useStatusBarEffect(colors.background, 'dark-content', true);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor='transparent' />
      <BackgroundPattern />
      <ScreenHeader
        title={t('screen.title')}
        onBackPress={handleGoBack}
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {error ? renderError() : renderBankAccountInfo()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  accountContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    minWidth: 120,
  },
  econtractSection: {
    backgroundColor: colors.light,
    borderRadius: 12,
    padding: spacing.lg,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
    color: colors.text.primary,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  econtractButton: {
    backgroundColor: getUserTypeColor(),
  },
});

export default BankAccountScreen;
