import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, SectionList, StatusBar, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, spacing, getFontFamily, FONT_WEIGHTS, typography } from '@/shared/themes';
import { Body, Text } from '@/shared/components';
import { Trash } from '@/shared/assets/icons';
import { EnsogoFlowerLogo } from '@/shared/assets/images';
import { RecipientService } from '../services/RecipientService';
import type { RecentRecipient } from '../types/transfer';
import { useStatusBarEffect } from '../../../shared/utils/StatusBarManager';
import { BackgroundPattern } from '@/shared/components/base';
import SearchBar from '@/shared/components/SearchBar';
import Plus from '@/shared/assets/icons/Plus';
import { AddRecipientBottomSheet } from '../components/AddRecipientBottomSheet';

export const RecipientsScreen: React.FC = () => {
  const { t } = useTranslation('payment');
  const { t: commonT } = useTranslation('common');
  const [recipients, setRecipients] = useState<RecentRecipient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isAddRecipientVisible, setIsAddRecipientVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const loadRecipients = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await RecipientService.getRecentRecipients({
        page: 1,
        limit: 50
      });
      if (response.success) {
        // Sort recipients alphabetically by last name
        const sortedRecipients = response.data.recentRecipients.sort((a, b) => {
          const getLastName = (name: string) => {
            const parts = name.trim().split(/\s+/);
            return parts[parts.length - 1] || name;
          };

          const lastNameA = getLastName(a.bankHolder);
          const lastNameB = getLastName(b.bankHolder);

          return lastNameA.localeCompare(lastNameB);
        });
        setRecipients(sortedRecipients);
      }
    } catch (error) {
      console.error('Error loading recipients:', error);
      Alert.alert(
        t('savedRecipients.errorLoading') || 'Error',
        t('savedRecipients.errorLoadingMessage') || 'Failed to load saved recipients'
      );
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  // Group recipients by first letter
  const groupedRecipients = useMemo(() => {
    // Filter recipients based on search text
    const filteredRecipients = recipients.filter(recipient => {
      if (!searchText.trim()) return true;

      const searchLower = searchText.toLowerCase();
      return (
        recipient.bankHolder.toLowerCase().includes(searchLower) ||
        recipient.bankNumber.toLowerCase().includes(searchLower) ||
        (recipient.note && recipient.note.toLowerCase().includes(searchLower))
      );
    });

    const groups: { [key: string]: RecentRecipient[] } = {};
    filteredRecipients.forEach(recipient => {
      // Extract last name (last word in the name)
      const nameParts = recipient.bankHolder.trim().split(/\s+/);
      const lastName = nameParts[nameParts.length - 1] || recipient.bankHolder;
      const firstLetter = lastName.charAt(0).toUpperCase();

      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(recipient);
    });

    // Convert to sections format for SectionList
    return Object.keys(groups)
      .sort()
      .map(letter => ({
        title: letter,
        data: groups[letter],
      }));
  }, [recipients, searchText]);

  useEffect(() => {
    loadRecipients();
  }, [loadRecipients]);

  useStatusBarEffect('transparent', 'dark-content', true);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRecipients();
    setRefreshing(false);
  }, [loadRecipients]);

  const handleAddRecipient = useCallback(() => {
    setIsAddRecipientVisible(true);
  }, []);

  const handleRecipientAdded = useCallback(async () => {
    setIsAddRecipientVisible(false);
    await loadRecipients(); // Refresh the recipients list
  }, [loadRecipients]);

  const handleDeleteRecipient = useCallback(async (recipientId: string) => {
    Alert.alert(
      t('savedRecipients.deleteConfirmTitle') || 'Delete Recipient',
      t('savedRecipients.deleteConfirmMessage') || 'Are you sure you want to delete this recipient?',
      [
        {
          text: commonT('common.cancel') || 'Cancel',
          style: 'cancel',
        },
        {
          text: commonT('common.delete') || 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(recipientId);
              const response = await RecipientService.deleteRecentRecipients({
                ids: [recipientId]
              });
              if (response.success) {
                setRecipients(prev => prev.filter(r => r.id !== recipientId));
                Alert.alert(
                  t('savedRecipients.deleteSuccess') || 'Success',
                  t('savedRecipients.deleteSuccessMessage') || 'Recipient deleted successfully'
                );
              } else {
                throw new Error(response.message);
              }
            } catch (error) {
              console.error('Error deleting recipient:', error);
              Alert.alert(
                t('savedRecipients.errorDeleting') || 'Error',
                t('savedRecipients.errorDeletingMessage') || 'Failed to delete recipient'
              );
            } finally {
              setIsDeleting(null);
            }
          },
        },
      ]
    );
  }, [t, commonT]);

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

  const renderRecipientItem = ({ item, index, section }: { item: RecentRecipient; index: number; section: any }) => {
    const isLastInSection = index === section.data.length - 1;

    const generateInitials = (name: string): string => {
      const words = name.trim().split(/\s+/);
      if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
      }
      const firstInitial = words[0].charAt(0).toUpperCase();
      const lastInitial = words[words.length - 1].charAt(0).toUpperCase();
      return firstInitial + lastInitial;
    };

    const initials = generateInitials(item.bankHolder);

    return (
      <View style={styles.recipientItem}>
        <View style={styles.recipientContent}>
          <View style={styles.recipientAvatar}>
            <Text style={styles.recipientInitials}>{initials}</Text>
            <View style={styles.logoOverlay}>
              <View style={{ top: 0.5 }}>
                <EnsogoFlowerLogo width={12} height={12} color={colors.light} />
              </View>
            </View>
          </View>
          <View style={styles.recipientInfo}>
            <Body style={styles.recipientName} numberOfLines={1}>
              {item.bankHolder}
            </Body>
            <Body style={styles.recipientAccount} numberOfLines={1}>
              {item.bankNumber}
            </Body>
            {item.note && (
              <Body style={styles.recipientNote} numberOfLines={1}>
                {item.note}
              </Body>
            )}
          </View>
          <View style={styles.recipientActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteRecipient(item.id)}
              disabled={isDeleting === item.id}
            >
              <Trash width={20} height={20} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
        {!isLastInSection && <View style={styles.separator} />}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Body style={styles.emptyTitle}>
        {t('savedRecipients.noRecipients') || 'No saved recipients'}
      </Body>
      <Body style={styles.emptyMessage}>
        {t('savedRecipients.noRecipientsMessage') || 'Add recipients to quickly transfer money'}
      </Body>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor='transparent' />
      {/* <BackgroundPattern /> */}
      <Text style={styles.title}>{t('savedRecipients.title') || 'Saved Recipients'}</Text>

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          placeholder={t('savedRecipients.searchPlaceholder') || 'Search recipients...'}
          rightIcon={<Plus width={16} height={16} color={colors.primary} />}
          onRightIconPress={handleAddRecipient}
          showExternalIcon={true}
          containerStyle={styles.searchBar}
        />
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Body>{t('savedRecipients.loading') || 'Loading recipients...'}</Body>
          </View>
        ) : recipients.length > 0 ? (
          <SectionList
            sections={groupedRecipients}
            keyExtractor={(item) => item.id}
            renderItem={renderRecipientItem}
            renderSectionHeader={renderSectionHeader}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            stickySectionHeadersEnabled={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          />
        ) : (
          renderEmptyState()
        )}
      </View>

      <AddRecipientBottomSheet
        isVisible={isAddRecipientVisible}
        onClose={() => setIsAddRecipientVisible(false)}
        onRecipientAdded={handleRecipientAdded}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    lineHeight: 32,
  },
  searchContainer: {
    marginBottom: spacing.lg,
  },
  searchBar: {
    marginBottom: 0,
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  recipientItem: {
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  recipientContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  recipientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 25,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    position: 'relative',
  },
  recipientInitials: {
    fontSize: 18,

    color: colors.primary,
  },
  logoOverlay: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 3,
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,

    color: colors.text.primary,
    marginBottom: 2,
  },
  recipientAccount: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  recipientNote: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  recipientActions: {
    marginLeft: 'auto',
  },
  actionButton: {
    padding: spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,

    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: 8,
  },
  sectionHeaderText: {
    fontSize: 18,
    color: colors.primary,

  },
});

export default RecipientsScreen;
