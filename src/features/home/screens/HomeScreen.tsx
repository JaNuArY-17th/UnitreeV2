import {
  View,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/shared/themes';
import { useTranslation } from '@/shared/hooks/useTranslation';
import {
  HomeHeader,
  ActionGrid,
  QuickAccessCard,
  HorizontalBalanceCards,
} from '../components';
import { CreateStoreBanner, VerificationBanner, StoreLockedBanner } from '../../../shared/components';
import {
  useHomeData,
  useHomeBanners,
  useHomeActions,
  useHomeAccounts,
  useHomeScroll,
} from '../hooks';
import RecentPaymentsList from '../components/RecentPaymentsList';
import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { userProfileQueryKeys } from '@/features/authentication/hooks/useUserProfile';
import { STORE_QUERY_KEYS } from '@/features/authentication/hooks/useStoreData';
import { BANK_QUERY_KEYS } from '@/features/deposit/hooks/useBankAccount';

const HomeScreen = () => {
  const { t } = useTranslation('home');
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const homeData = useHomeData();
  const {
    userData,
    storeData,
    unreadNotificationCount,
    isFetchingBankAccount,
    isPostpaidLoading,
    verificationStatus,
    currentBankType,
  } = homeData;

  const {
    showVerificationBanner,
    showCreateStoreBanner,
    showStoreLockedBanner,
    setDismissed,
    userAccountType,
  } = useHomeBanners(homeData);

  const {
    actionItems,
    handleNotificationPress,
    handleBalancePress,
    handleAccountSelect,
    handleCheckNowPress,
    handleSecondaryAction,
    handleQuickAccess,
  } = useHomeActions(userAccountType);

  const {
    accountTypes,
    selectedAccountType,
    handleAccountTypeChange,
    mainAccountBalanceVisible,
    toggleMainAccountBalanceVisibility,
    totalBalanceVisible,
    toggleTotalBalanceVisibility,
    withdrawableBalanceVisible,
    toggleWithdrawableBalanceVisibility,
  } = useHomeAccounts(homeData);

  const scrollY = useSharedValue(0);
  const insets = useSafeAreaInsets();
  const [isScrolled, setIsScrolled] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);

  const SCREEN_HEIGHT = Dimensions.get('window').height;
  const MAX_PARALLAX_SCROLL = SCREEN_HEIGHT * 0.5; // 50% of screen height

  const onHeaderLayout = useCallback((e: any) => {
    setHeaderHeight(e.nativeEvent.layout.height);
  }, []);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
    const threshold = headerHeight > 0 ? headerHeight - insets.top : 100;
    if (scrollY.value > threshold && !isScrolled) {
      runOnJS(setIsScrolled)(true);
    } else if (scrollY.value <= threshold && isScrolled) {
      runOnJS(setIsScrolled)(false);
    }
  });

  const headerBackgroundStyle = useAnimatedStyle(() => {
    const clampedScrollY = Math.max(scrollY.value, -MAX_PARALLAX_SCROLL);
    return {
      top: interpolate(
        clampedScrollY,
        [-MAX_PARALLAX_SCROLL, 0],
        [-MAX_PARALLAX_SCROLL, 0],
        Extrapolation.CLAMP
      ),
    };
  });

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    console.log('🔄 [HomeScreen] Pull to refresh - invalidating all queries...');

    try {
      // Invalidate all critical queries
      await Promise.all([
        // User profile and verification status
        queryClient.invalidateQueries({
          queryKey: userProfileQueryKeys.all,
          refetchType: 'active'
        }),
        // Store data
        queryClient.invalidateQueries({
          queryKey: STORE_QUERY_KEYS.all,
          refetchType: 'active'
        }),
        // Bank account data
        currentBankType && queryClient.invalidateQueries({
          queryKey: BANK_QUERY_KEYS.account(currentBankType),
          refetchType: 'active'
        }),
      ]);

      console.log('✅ [HomeScreen] All queries invalidated successfully');
    } catch (error) {
      console.error('❌ [HomeScreen] Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient, currentBankType]);

  return (
    <View style={styles.container}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: insets.top + 10,
          backgroundColor: colors.primary,
          zIndex: 0,
        }}
      />
      <StatusBar
        barStyle={isScrolled ? 'dark-content' : 'light-content'}
        backgroundColor="transparent"
        translucent
      />
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: insets.top,
          backgroundColor: isScrolled ? colors.light : 'transparent',
          zIndex: 100,
        }}
      />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        bounces={true}
        overScrollMode="auto"
        scrollEventThrottle={16}
        stickyHeaderIndices={undefined}
        onScroll={scrollHandler}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.light}
            colors={[colors.primary]}
            progressBackgroundColor={colors.light}
          />
        }
      >
        <View onLayout={onHeaderLayout}>
          <HomeHeader
            businessName={
              userAccountType === 'STORE'
                ? (storeData?.name || t('hello'))
                : (userData?.full_name ? `${t('hello')} ${userData.full_name}` : 'Hello!')
            }
            status={userAccountType === 'STORE' ? storeData?.status : undefined}
            onNotificationPress={handleNotificationPress}
            hasNotification={unreadNotificationCount > 0}
            backgroundStyle={headerBackgroundStyle}
          >
            <HorizontalBalanceCards
              accountTypes={accountTypes as any}
              selectedAccountType={selectedAccountType}
              onAccountTypeChange={handleAccountTypeChange}
              onBalancePress={handleBalancePress}
              onAccountSelect={handleAccountSelect}
              onCheckNowPress={handleCheckNowPress}
              totalBalanceVisible={totalBalanceVisible}
              onTotalBalanceVisibilityChange={toggleTotalBalanceVisibility}
              withdrawableBalanceVisible={withdrawableBalanceVisible}
              onWithdrawableVisibilityChange={toggleWithdrawableBalanceVisibility}
              mainAccountBalanceVisible={mainAccountBalanceVisible}
              onMainAccountBalanceVisibilityChange={toggleMainAccountBalanceVisibility}
              isMainAccountLoading={isFetchingBankAccount}
              isEspayLoading={isPostpaidLoading}
            />

            <View style={styles.actionsSection}>
              <ActionGrid actions={actionItems} textColor='white' />
            </View>
          </HomeHeader>
        </View>

        <View style={styles.mainContent}>
          {/* Banners Section - Stacked, only one visible at a time */}
          {(showVerificationBanner || showCreateStoreBanner || showStoreLockedBanner) && (
            <View style={styles.bannersSection}>
              {/* Priority order: VerificationBanner -> CreateStoreBanner -> StoreLockedBanner */}
              {showVerificationBanner && (
                <VerificationBanner
                  key={verificationStatus} // Force re-render when status changes to prevent stale closure
                  status={userData?.verify_status || 'NOT_VERIFIED'}
                  onDismiss={() => setDismissed(true)}
                />
              )}

              {!showVerificationBanner && showCreateStoreBanner && (
                <CreateStoreBanner
                  onPrimaryAction={handleSecondaryAction}
                  onDismiss={() => setDismissed(true)}
                />
              )}

              {!showVerificationBanner && !showCreateStoreBanner && showStoreLockedBanner && (
                <StoreLockedBanner
                  onDismiss={() => setDismissed(true)}
                />
              )}
            </View>
          )}

          {/* Quick Access Cards for STORE, Recent Payments for USER */}
          <View style={styles.paymentsSection}>
            {userAccountType === 'STORE' ? (
              <QuickAccessCard
                onVoiceInvoice={handleQuickAccess.onVoiceInvoice}
                onManageInvoice={handleQuickAccess.onManageInvoice}
                onManageProducts={handleQuickAccess.onManageProducts}
                onSearchProducts={handleQuickAccess.onSearchProducts}
                onDraftOrders={handleQuickAccess.onDraftOrders}
                onInventoryManagement={handleQuickAccess.onInventoryManagement}
                onVoucherManagement={handleQuickAccess.onVoucherManagement}
              />
            ) : (
              <RecentPaymentsList />
            )}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 100, // Extra padding to prevent bottom bounce revealing background
  },
  actionsSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  mainContent: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  bannersSection: {
    marginBottom: spacing.lg,
  },
  paymentsSection: {
    marginBottom: spacing.lg,
    marginHorizontal: spacing.lg,
  },
  verifyBanner: {
    marginBottom: spacing.md,
  },
});

export default HomeScreen;
