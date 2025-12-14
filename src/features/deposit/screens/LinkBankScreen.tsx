import React, { useState, useMemo } from 'react';
import { View, StyleSheet, StatusBar, Alert, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, FONT_WEIGHTS, getFontFamily, spacing } from '@/shared/themes';
import { BackgroundPattern, Body, Button, KeyboardDismissWrapper } from '@/shared/components/base';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation';
import { useTranslation } from '@/shared/hooks/useTranslation';
import ScreenHeader from '@/shared/components/ScreenHeader';
import { LinkBankSelectionModal, BankSelectionCard } from '../components';
import { useLinkBank, useLinkedBanks } from '../hooks';
import type { LinkBankRequest } from '../types/bank';
import type { SelectableBank } from '../hooks/useSelectableBanks';
import { useQueryClient } from '@tanstack/react-query';
import { BANK_QUERY_KEYS } from '../hooks/useBankAccount';

const LinkBankScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation('deposit');
  const queryClient = useQueryClient();

  // State
  const [selectedBank, setSelectedBank] = useState<SelectableBank | undefined>();
  const [showBankModal, setShowBankModal] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [holderName, setHolderName] = useState('');

  // Hooks
  const linkBankMutation = useLinkBank();
  const { data: linkedBanksResponse } = useLinkedBanks();
  const linkedBanks = linkedBanksResponse?.data || [];

  // Maximum linked banks limit
  const MAX_LINKED_BANKS = 5;

  // Validation
  const accountNumberError = useMemo(() => {
    if (!accountNumber.trim()) return '';

    // Basic account number validation
    const cleanNumber = accountNumber.replace(/\s/g, '');
    if (cleanNumber.length < 6) {
      return t('linkBank.errors.accountNumberTooShort');
    }
    if (cleanNumber.length > 20) {
      return t('linkBank.errors.accountNumberTooLong');
    }
    if (!/^\d+$/.test(cleanNumber)) {
      return t('linkBank.errors.accountNumberInvalid');
    }

    return '';
  }, [accountNumber, t]);

  const holderNameError = useMemo(() => {
    if (!holderName.trim()) return '';
    if (holderName.trim().length < 3) return t('linkBank.errors.holderNameTooShort', '');
    return '';
  }, [holderName, t]);

  const canSubmit = useMemo(() => {
    return selectedBank && accountNumber.trim() && holderName.trim() && !accountNumberError && !holderNameError && !isSubmitting;
  }, [selectedBank, accountNumber, holderName, accountNumberError, holderNameError, isSubmitting]);

  // Handlers
  const handleBankSelect = (bank: SelectableBank) => {
    setSelectedBank(bank);
    setShowBankModal(false);
  };

  const handleSubmit = async () => {
    if (!selectedBank || !accountNumber.trim() || !holderName.trim()) return;

    // Check if limit is reached
    if (linkedBanks.length >= MAX_LINKED_BANKS) {
      Alert.alert(
        t('linkBank.errors.title'),
        t('linkBank.errors.limitReached', { max: MAX_LINKED_BANKS })
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const request: LinkBankRequest = {
        citad: selectedBank.citad,
        // Use official bank name from list-bank API (bnkNm) to satisfy backend validation
        name: selectedBank.listBank?.bnkNm || selectedBank.name,
        number: accountNumber.replace(/\s/g, ''),
        holderName: holderName.trim(),
      };

      await linkBankMutation.mutateAsync(request);

      // Invalidate linked banks query to refresh the list
      await queryClient.invalidateQueries({
        queryKey: BANK_QUERY_KEYS.linkedBanks(),
      });

      Alert.alert(
        t('linkBank.success.title'),
        t('linkBank.success.message'),
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Link bank error:', error);

      let errorMessage = t('linkBank.errors.general');
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Alert.alert(
        t('linkBank.errors.title'),
        errorMessage
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAccountNumber = (text: string) => {
    // Remove all non-digits
    const digits = text.replace(/\D/g, '');

    // Add spaces every 4 digits for better readability
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handleAccountNumberChange = (text: string) => {
    const formatted = formatAccountNumber(text);
    setAccountNumber(formatted);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <BackgroundPattern />
      <StatusBar barStyle="dark-content" backgroundColor='transparent' />
      <ScreenHeader title={t('linkBank.title')} centerTitle />

      <KeyboardDismissWrapper style={{ flex: 1 }}>
        <View style={styles.content}>
          {/* Bank Selection */}
          <View style={styles.section}>
            <Body style={styles.label}>{t('linkBank.selectBank')}</Body>
            <BankSelectionCard
              selectedBank={selectedBank}
              onPress={() => setShowBankModal(true)}
            />
          </View>

          {/* Account Number Input */}
          <View style={styles.section}>
            <Body style={styles.label}>{t('linkBank.accountNumber')}</Body>
            <TextInput
              style={[styles.input, accountNumberError && styles.inputError]}
              value={accountNumber}
              onChangeText={handleAccountNumberChange}
              placeholder={t('linkBank.accountNumberPlaceholder')}
              placeholderTextColor={colors.text.secondary}
              // keyboardType="numeric"
              maxLength={25} // Account for spaces
            />
            {accountNumberError && (
              <Body style={styles.errorText}>{accountNumberError}</Body>
            )}
            <Body style={styles.helperText}>{t('linkBank.accountNumberHelper')}</Body>
          </View>

          {/* Account Holder Name Input */}
          <View style={styles.section}>
            <Body style={styles.label}>{t('qr.accountHolder', 'Account holder')}</Body>
            <TextInput
              style={[styles.input, holderNameError && styles.inputError]}
              value={holderName}
              onChangeText={setHolderName}
              placeholder={t('qr.accountHolder', 'Account holder name')}
              placeholderTextColor={colors.text.secondary}
              autoCapitalize="words"
              maxLength={60}
            />
            {holderNameError && (
              <Body style={styles.errorText}>{holderNameError}</Body>
            )}
          </View>

          {/* Instructions */}
          <View style={styles.instructionsSection}>
            <Body style={styles.instructionsTitle}>{t('linkBank.instructions.title')}</Body>
            <Body style={styles.instructionsText}>{t('linkBank.instructions.step1')}</Body>
            <Body style={styles.instructionsText}>{t('linkBank.instructions.step2')}</Body>
            <Body style={styles.instructionsText}>{t('linkBank.instructions.step3')}</Body>
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.footer}>
          <Button
            label={isSubmitting ? t('linkBank.linking') : t('linkBank.linkBank')}
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleSubmit}
            disabled={!canSubmit}
            loading={isSubmitting}
          />
        </View>
      </KeyboardDismissWrapper>

      {/* Bank Selection Modal */}
      <LinkBankSelectionModal
        visible={showBankModal}
        onClose={() => setShowBankModal(false)}
        onSelectBank={handleBankSelect}
        selectedBank={selectedBank}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: 16,

    color: colors.text.primary,
    marginBottom: spacing.sm,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.background,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  helperText: {
    color: colors.text.secondary,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  instructionsSection: {
    backgroundColor: colors.light,
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.lg,
  },
  instructionsTitle: {
    fontSize: 16,

    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  instructionsText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  footer: {
    padding: spacing.lg,
    // borderTopWidth: 1,
    // borderTopColor: colors.border,
  },
});

export default LinkBankScreen;
