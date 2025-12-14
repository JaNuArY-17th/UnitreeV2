import React from 'react';
import { View, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';
import { colors, spacing } from '@/shared/themes';
import { ScreenHeader } from '@/shared/components';
import {
  TabType,
  LoanContent,
  AccountContent,
} from '../components';
import type { RootStackParamList } from '@/navigation/types';
import VerificationRequiredOverlay from '@/shared/components/VerificationRequiredOverlay';
import { ToggleButton } from '@/features/deposit/components';
import {
  Wallet01Icon,
  AffiliateIcon,
} from '@hugeicons/core-free-icons';

const AccountManagementScreen: React.FC = () => {
  const { t } = useTranslation('account');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const initialTab = (route.params as any)?.activeTab || 'account';
  const [activeTab, setActiveTab] = React.useState<TabType>(initialTab);

  useStatusBarEffect('transparent', 'light-content', true);

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <VerificationRequiredOverlay>
      <View style={styles.container}>
        <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.primary }]} />
          <StatusBar barStyle="light-content" backgroundColor='transparent' translucent />

          <ScreenHeader
            title={t('title')}
            titleStyle={{ color: colors.light }}
            backIconColor={colors.light}
            showBack={true}
            onBackPress={handleBack}
          />

          <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.md }}>
            <ToggleButton
              value={activeTab}
              onValueChange={setActiveTab}
              leftLabel={t('tabs.account')}
              rightLabel={t('tabs.loan')}
              leftValue="account"
              rightValue="loan"
              leftIcon={Wallet01Icon}
              rightIcon={AffiliateIcon}
              variant="onPrimary"
            />
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {activeTab === 'account' && (
            <AccountContent />
          )}

          {activeTab === 'loan' && (
            <LoanContent />
          )}
        </ScrollView>
      </View>
    </VerificationRequiredOverlay >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    paddingBottom: spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background,
  },
});

export default AccountManagementScreen;
