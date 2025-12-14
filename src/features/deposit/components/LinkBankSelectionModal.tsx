import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TextInput, ActivityIndicator, Image, Pressable, FlatList } from 'react-native';
import { colors, getFontFamily, spacing, FONT_WEIGHTS } from '@/shared/themes';
import { Body, Button, BottomSheetModal } from '@/shared/components/base';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useSelectableBanks } from '../hooks/useSelectableBanks';
import type { SelectableBank } from '../hooks/useSelectableBanks';

interface LinkBankSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectBank: (bank: SelectableBank) => void;
  selectedBank?: SelectableBank;
}

const LinkBankSelectionModal: React.FC<LinkBankSelectionModalProps> = ({
  visible,
  onClose,
  onSelectBank,
  selectedBank,
}) => {
  const { t } = useTranslation('deposit');
  const [searchQuery, setSearchQuery] = useState('');
  const { selectableBanks, isLoading, isError, refetch } = useSelectableBanks();

  const filteredBanks = useMemo(() => {
    if (!selectableBanks) return [];
    if (!searchQuery.trim()) return selectableBanks;
    const q = searchQuery.toLowerCase().trim();
    return selectableBanks.filter((b: any) => b._search?.includes(q));
  }, [selectableBanks, searchQuery]);

  const renderBankItem = ({ item: bank }: { item: SelectableBank }) => {
    const isSelected = selectedBank?.id === bank.id;
    return (
      <Pressable
        style={[styles.bankItem, isSelected && styles.selectedBankItem]}
        onPress={() => onSelectBank(bank)}
        accessibilityRole="button"
        accessibilityLabel={`Select ${bank.short_name || bank.name}`}
      >
        <View style={styles.bankItemContent}>
          <View style={styles.logoContainer}>
            {bank.logo ? (
              <Image
                source={typeof bank.logo === 'string' ? { uri: bank.logo } : bank.logo}
                style={styles.bankLogo}
                resizeMode="contain"
              />
            ) : null}
          </View>
          <View style={styles.bankInfo}>
            <Body style={[styles.bankShortName, isSelected && styles.selectedText]}>
              {bank.short_name || bank.name}
            </Body>
            {bank.short_name && (
              <Body style={[styles.bankFullName, isSelected && styles.selectedText]}>
                {bank.name}
              </Body>
            )}
          </View>
        </View>
        {isSelected && (
          <View style={styles.checkmark}>
            <Body style={styles.checkmarkText}>✓</Body>
          </View>
        )}
      </Pressable>
    );
  };

  if (isError) {
    return (
      <BottomSheetModal visible={visible} onClose={onClose} title={t('bankSelection.title')}>
        <View style={styles.centerContainer}>
          <Body style={styles.errorText}>{t('bankSelection.error')}</Body>
          <Button label={t('bankSelection.retry')} variant="outline" onPress={() => refetch()} />
        </View>
      </BottomSheetModal>
    );
  }

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title={t('bankSelection.title')}
      maxHeightRatio={0.7}
      fillToMaxHeight
      footerContent={selectedBank ? (
        <Button
          label={t('bankSelection.confirm')}
          variant="primary"
          size="lg"
          fullWidth
          onPress={onClose}
        />
      ) : undefined}
    >
      <FlatList
        data={isLoading ? [] : filteredBanks}
        keyExtractor={(item: SelectableBank) => item.id.toString()}
        renderItem={renderBankItem}
        ListHeaderComponent={
          <View>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder={t('bankSelection.searchPlaceholder')}
                placeholderTextColor={colors.text.secondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {isLoading && (
              <View style={styles.loadingInline}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Body style={styles.loadingText}>{t('bankSelection.loading')}</Body>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={!isLoading ? (
          <View style={styles.centerContainer}>
            <Body style={styles.emptyText}>{t('bankSelection.noResults')}</Body>
          </View>
        ) : null}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        nestedScrollEnabled={true}
      />
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  searchContainer: { paddingVertical: spacing.md, paddingHorizontal: spacing.md },
  searchInput: { height: 48, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.md, fontSize: 16, color: colors.text.primary, backgroundColor: colors.background },
  bankList: { flex: 1 },
  bankItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderRadius: 8 },
  bankItemContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  logoContainer: { width: 48, height: 48, marginRight: spacing.md, borderRadius: 4, backgroundColor: colors.lightGray, alignItems: 'center', justifyContent: 'center' },
  bankLogo: { width: 44, height: 44, borderRadius: 4 },
  selectedBankItem: { backgroundColor: colors.primary + '10', borderWidth: 1, borderColor: colors.primary },
  bankInfo: { flex: 1 },
  bankShortName: { fontSize: 16, color: colors.text.primary, marginBottom: spacing.xs },
  bankFullName: { fontSize: 14, color: colors.text.secondary },
  selectedText: { color: colors.primary },
  checkmark: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  checkmarkText: { color: colors.light, fontSize: 14, fontFamily: getFontFamily(FONT_WEIGHTS.BOLD) },
  separator: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.md },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl },
  loadingText: { marginTop: spacing.md, color: colors.text.secondary },
  errorText: { color: colors.danger, textAlign: 'center', marginBottom: spacing.md },
  emptyText: { color: colors.text.secondary, textAlign: 'center' },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  loadingInline: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  listContent: { paddingBottom: spacing.xxxl },
});

export default LinkBankSelectionModal;
