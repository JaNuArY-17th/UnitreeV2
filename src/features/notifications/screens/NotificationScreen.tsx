import React, { useState, useMemo } from 'react';
import { View, StyleSheet, StatusBar, TouchableOpacity, FlatList, ActivityIndicator, SectionList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, spacing, dimensions, getFontFamily, FONT_WEIGHTS, typography } from '@/shared/themes';
import { Text } from '@/shared/components/base';
import { ScreenHeader } from '@/shared/components';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { NotificationOff01Icon, CheckmarkCircle01Icon } from '@hugeicons/core-free-icons';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';
import { useNotifications } from '../hooks/useNotifications';
import { useMarkNotificationRead } from '../hooks/useMarkNotificationRead';
import { NotificationItem } from '../components/NotificationItem';
import NotificationScreenSkeleton from '../components/NotificationScreenSkeleton';
import { notificationService } from '../services/notificationService';
import { getUserTypeColor } from '@/shared/themes/colors';

// Separator for FlatList
const NotificationSeparator = () => (
  <View style={{ height: 1, backgroundColor: colors.light }}>
    <View style={{ height: 0.5, backgroundColor: colors.border, marginHorizontal: spacing.lg }} />
  </View>
);

type NotificationTabType = 'all' | 'unread' | 'read';

interface NotificationTab {
  key: NotificationTabType;
  label: string;
  count: number;
}

const NotificationScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('notifications');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [activeTab, setActiveTab] = useState<NotificationTabType>('all');
  const [searchText, setSearchText] = useState('');

  // Map tab to isRealFilter param for API
  const tabToFilter: Record<NotificationTabType, string> = {
    all: 'ALL',
    unread: 'UNREAD',
    read: 'READ',
  };

  // Fetch notifications from API
  const {
    data: notificationData,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNotifications({
    isRealFilter: tabToFilter[activeTab],
    limit: 20,
    search: searchText.trim() || undefined,
  });

  // Flatten notifications from all pages
  const notifications = useMemo(() => {
    return notificationData?.pages.flatMap((page: any) => page.data.notification) || [];
  }, [notificationData]);

  const sections = useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const grouped = [
      { title: t('sections.today', { defaultValue: 'Hôm nay' }), data: [] as any[] },
      { title: t('sections.yesterday', { defaultValue: 'Hôm qua' }), data: [] as any[] },
      { title: t('sections.earlier', { defaultValue: 'Trước đó' }), data: [] as any[] },
    ];

    notifications.forEach((item: any) => {
      const itemDate = new Date(item.createdAt);
      if (itemDate.toDateString() === today.toDateString()) {
        grouped[0].data.push(item);
      } else if (itemDate.toDateString() === yesterday.toDateString()) {
        grouped[1].data.push(item);
      } else {
        grouped[2].data.push(item);
      }
    });
 
    return grouped.filter(section => section.data.length > 0);
  }, [notifications, t]);

  // Get the latest page data for counts
  const latestPageData = notificationData?.pages[notificationData.pages.length - 1]?.data;

  // Hook to mark notification as read
  const { markAsRead } = useMarkNotificationRead();

  useStatusBarEffect(getUserTypeColor(), 'light-content', true);

  // Calculate tab counts from API data
  const tabs: NotificationTab[] = useMemo(() => [
    {
      key: 'all',
      label: t('tabs.all'),
      count: latestPageData?.totalItems || 0,
    },
    {
      key: 'unread',
      label: t('tabs.unread'),
      count: latestPageData?.countUnread || 0,
    },
    {
      key: 'read',
      label: t('tabs.read'),
      count: latestPageData?.countRead || 0,
    },
  ], [latestPageData, t]);

  const renderTabButton = (tab: NotificationTab) => {
    const isActive = activeTab === tab.key;
    return (
      <TouchableOpacity
        key={tab.key}
        style={[styles.tabButton, isActive && styles.activeTabButton]}
        onPress={() => setActiveTab(tab.key)}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabText, isActive && styles.activeTabText]}>
          {tab.label} ({tab.count})
        </Text>
      </TouchableOpacity>
    );
  };


  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <HugeiconsIcon icon={NotificationOff01Icon} size={64} color={colors.text.secondary} />
      </View>
      <Text style={styles.emptyTitle}>{t('emptyState.title')}</Text>
      <Text style={styles.emptySubtitle}>{t('emptyState.subtitle')}</Text>
    </View>
  );

  const renderNotificationItem = ({ item }: any) => (
    <NotificationItem item={item} onPress={handleNotificationPress} />
  );

  // Handle notification press
  const handleNotificationPress = async (item: any) => {
    // Mark notification as read if it's unread
    if (!item.isRead) {
      await markAsRead(item.id, {
        optimistic: () => {
          // Optimistically update the UI by refetching
          console.log('🔔 [NotificationScreen] Marking notification as read:', item.id);
        },
        onSuccess: () => {
          // Refetch to get updated counts and status
          console.log('✅ [NotificationScreen] Notification marked as read successfully');
          refetch();
        },
        onError: (error) => {
          // Handle 409 (already read) as success to avoid spamming API
          if (error.status === 409) {
            console.log('✅ [NotificationScreen] Notification was already marked as read');
            refetch();
          } else {
            console.error('❌ [NotificationScreen] Failed to mark notification as read:', error);
          }
        }
      });
    }

    // Handle financial notifications - navigate to AccountManagementScreen with loan tab
    if (item.type === 'financial') {
      console.log('🔄 [NotificationScreen] Navigating to account management loan tab for financial notification');

      // Navigate to AccountManagementScreen with loan tab
      navigation.navigate('AccountManagement', { activeTab: 'loan' });
    }
    // Only handle balance_change notifications with TransactionDetail URL
    else if (item.type === 'balance_change' && item.url && item.url.startsWith('TransactionDetail/')) {
      // Extract transaction ID from URL (remove "TransactionDetail/" prefix)
      const transactionId = item.url.replace('TransactionDetail/', '');

      console.log('🔄 [NotificationScreen] Navigating to transaction detail:', transactionId);

      // Navigate to TransactionDetailScreen with the transaction ID
      navigation.navigate('TransactionDetail', {
        transaction: transactionId,
      });
    }
    // Handle system notifications - navigate to StoreDetailScreen
    else if (item.type === 'system') {
      console.log('🔄 [NotificationScreen] Navigating to store detail for system notification');

      // Navigate to StoreDetailScreen
      navigation.navigate('StoreDetail');
    }
    // For other notification types, you can add additional handling here if needed
  };

  // Mark all as read handler
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllNotificationsAsRead();
      refetch();
    } catch (e) {
      // Optionally show error feedback
    }
  };

  return (
    <View style={[styles.container]}>
      <StatusBar barStyle="light-content" backgroundColor='transparent' />

      {/* Header with green background */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <ScreenHeader
          title={t('title')}
          showBack={true}
          backIconColor={colors.light}
          titleStyle={styles.headerTitle}
          containerStyle={styles.headerStyle}
          actions={[
            {
              key: 'mark-all-read',
              icon: <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} color={colors.light} />,
              onPress: handleMarkAllAsRead,
            }
          ]}
        />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {tabs.map(renderTabButton)}
      </View>

      {/* Content Area */}
      <View style={styles.contentContainer}>
        {isLoading ? (
          <NotificationScreenSkeleton />
        ) : isError ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>{t('error.title', { ns: 'common', defaultValue: 'Có lỗi xảy ra' })}</Text>
            <Text style={styles.emptySubtitle}>{t('error.subtitle', { ns: 'common', defaultValue: 'Không thể tải thông báo.' })}</Text>
          </View>
        ) : notifications.length > 0 ? (
          <SectionList
            sections={sections}
            renderItem={renderNotificationItem}
            renderSectionHeader={({ section: { title } }) => (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>{title}</Text>
              </View>
            )}
            keyExtractor={item => item.id}
            onRefresh={refetch}
            refreshing={isLoading}
            // ItemSeparatorComponent={NotificationSeparator}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={{ padding: spacing.lg, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={getUserTypeColor()} />
                </View>
              ) : null
            }
            stickySectionHeadersEnabled={false}
          />
        ) : (
          renderEmptyState()
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    backgroundColor: getUserTypeColor(),
  },
  headerStyle: {
    backgroundColor: 'transparent',
  },
  headerTitle: {
    ...typography.h2,
    color: colors.light,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: getUserTypeColor(),
    paddingHorizontal: spacing.lg,
    // paddingBottom: spacing.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: colors.light,
  },
  tabText: {
    ...typography.body,
    color: colors.light,
    opacity: 0.7,
  },
  activeTabText: {
    opacity: 1,

  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIconContainer: {
    position: 'relative',
    marginBottom: spacing.xl,
  },
  strikeThrough: {
    position: 'absolute',
    top: '50%',
    left: -10,
    right: -10,
    height: 3,
    backgroundColor: colors.text.secondary,
    transform: [{ rotate: '45deg' }],
  },
  emptyTitle: {
    ...typography.title,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionHeader: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    // paddingVertical: spacing.sm,
    paddingTop: spacing.md,
  },
  sectionHeaderText: {
    ...typography.title,
    color: colors.primary,
  },
});

export default NotificationScreen;
