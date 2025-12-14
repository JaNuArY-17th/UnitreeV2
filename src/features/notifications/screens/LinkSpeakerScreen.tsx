import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, spacing, getFontFamily, FONT_WEIGHTS, dimensions } from '@/shared/themes';
import { BackgroundPattern, Text } from '@/shared/components/base';
import { ScreenHeader } from '@/shared/components';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { QrCodeIcon } from '@hugeicons/core-free-icons';

const LinkSpeakerScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('notifications');
  const navigation = useNavigation();
  const [serialNumber, setSerialNumber] = useState('');

  useStatusBarEffect('transparent', 'dark-content', true);

  const handleScan = () => {
    // TODO: Open QR scanner
    console.log('Open QR scanner');
  };

  const handleContinue = () => {
    if (!serialNumber.trim()) {
      return;
    }
    // TODO: Handle linking device
    console.log('Link device with serial:', serialNumber);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      <BackgroundPattern />

      <ScreenHeader title={t('speaker.linkSpeaker')} showBack />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Guide Section */}
        <View style={styles.guideSection}>
          <Text style={styles.guideTitle}>{t('speaker.guide')}</Text>
          <Text style={styles.guideText}>
            {t('speaker.guideDescription')}
          </Text>

          {/* Device Image */}
          <View style={styles.imageContainer}>
            <View style={styles.deviceImagePlaceholder}>
              <View style={styles.serialBox}>
                <Text style={styles.serialLabel}>Serial</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Serial Input Section */}
        <View style={styles.inputSection}>
          <View style={styles.labelRow}>
            <Text style={styles.inputLabel}>
              {t('speaker.serialNumber')} <Text style={styles.required}>*</Text>
            </Text>
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={serialNumber}
              onChangeText={setSerialNumber}
              placeholder={t('speaker.enterSerialNumber')}
              placeholderTextColor={colors.text.secondary}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.scanButton}
              onPress={handleScan}
              activeOpacity={0.7}
            >
              <HugeiconsIcon icon={QrCodeIcon} size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !serialNumber.trim() && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!serialNumber.trim()}
          activeOpacity={0.7}
        >
          <Text style={styles.continueButtonText}>
            {t('speaker.continue')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  guideSection: {
    backgroundColor: colors.light,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  guideTitle: {
    fontSize: dimensions.fontSize.lg,

    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  guideText: {
    fontSize: dimensions.fontSize.md,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  deviceImagePlaceholder: {
    width: 200,
    height: 120,
    backgroundColor: '#E8EBF0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  serialBox: {
    backgroundColor: colors.light,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.danger,
  },
  serialLabel: {
    fontSize: dimensions.fontSize.sm,

    color: colors.text.primary,
  },
  inputSection: {
    marginBottom: spacing.xl,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  inputLabel: {
    fontSize: dimensions.fontSize.md,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
    color: colors.text.primary,
  },
  required: {
    color: colors.danger,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  textInput: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: dimensions.fontSize.md,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.primary,
  },
  scanButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  continueButton: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: dimensions.fontSize.lg,

    color: colors.light,
  },
});

export default LinkSpeakerScreen;
