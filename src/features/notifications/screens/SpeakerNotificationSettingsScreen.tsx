import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Tts from 'react-native-tts';

import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, spacing, dimensions, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';
import { BackgroundPattern, Text } from '@/shared/components/base';
import { ScreenHeader } from '@/shared/components';
import { MenuSection } from '@/features/profile/components/MenuSection';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Megaphone01Icon, VolumeHighIcon } from '@hugeicons/core-free-icons';
import { useStatusBarEffect } from '@shared/utils/StatusBarManager';
import { speakerNotificationService } from '../services/speakerNotificationService';
import type { SpeakerNotificationSettings } from '../types';

const SpeakerNotificationSettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('notifications');

  const [settings, setSettings] = useState<SpeakerNotificationSettings>({
    enabled: false,
    backgroundEnabled: false,
    messageTemplate: t('speaker.defaultTemplate'),
    volume: 1.0,
    pitch: 1.0,
    rate: 1.0,
    language: 'vi-VN',
  });

  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useStatusBarEffect('transparent', 'dark-content', true);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    initializeTts();

    return () => {
      Tts.stop();
    };
  }, []);

  const initializeTts = async () => {
    try {
      await speakerNotificationService.initializeTts();

      // Set default voice for Android
      if (Platform.OS === 'android') {
        try {
          const voices = await Tts.voices();
          const vietnameseVoice = voices.find((v: any) =>
            v.language && (v.language.includes('vi') || v.language.includes('VN'))
          );
          if (vietnameseVoice) {
            await Tts.setDefaultVoice(vietnameseVoice.id);
            console.log('✅ Set Vietnamese voice:', vietnameseVoice.name);
          } else {
            console.log('⚠️ No Vietnamese voice available');
          }
        } catch (voiceError) {
          console.log('⚠️ Could not set specific voice, using default');
        }
      }
    } catch (error) {
      console.error('Failed to initialize TTS:', error);
      // Don't show error to user, TTS will still try to work with defaults
    }
  };

  const loadSettings = async () => {
    try {
      const savedSettings = await speakerNotificationService.getSettings();
      if (savedSettings) {
        setSettings(savedSettings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleToggleEnabled = async (value: boolean) => {
    if (value) {
      // Request notification permissions when enabling
      const hasPermission = await speakerNotificationService.requestNotificationPermission();
      if (!hasPermission) {
        Alert.alert(
          t('speaker.permissionRequired'),
          t('speaker.permissionMessage'),
          [{ text: t('common:ok') }]
        );
        return;
      }
    }

    setSettings(prev => ({ ...prev, enabled: value }));
  };

  const handleToggleBackground = (value: boolean) => {
    setSettings(prev => ({ ...prev, backgroundEnabled: value }));
  };

  const handleMessageTemplateChange = (text: string) => {
    setSettings(prev => ({ ...prev, messageTemplate: text }));
  };

  const handleTestSpeaker = async () => {
    if (!settings.messageTemplate.trim()) {
      Alert.alert(
        t('speaker.error'),
        t('speaker.emptyMessageError'),
        [{ text: t('common:ok') }]
      );
      return;
    }

    setIsTesting(true);
    try {
      // Replace template variables with sample data
      const testMessage = speakerNotificationService.formatMessage(
        settings.messageTemplate,
        {
          amount: '10,000',
          sender: 'NGUYEN VAN A',
          time: new Date().toLocaleTimeString('vi-VN'),
          bankName: 'BIDV',
        }
      );

      await speakerNotificationService.speak(testMessage, settings);
    } catch (error) {
      Alert.alert(
        t('speaker.error'),
        t('speaker.testError'),
        [{ text: t('common:ok') }]
      );
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    if (!settings.messageTemplate.trim()) {
      Alert.alert(
        t('speaker.error'),
        t('speaker.emptyMessageError'),
        [{ text: t('common:ok') }]
      );
      return;
    }

    setIsSaving(true);
    try {
      await speakerNotificationService.saveSettings(settings);
      Alert.alert(
        t('speaker.success'),
        t('speaker.settingsSaved'),
        [{ text: t('common:ok') }]
      );
    } catch (error) {
      Alert.alert(
        t('speaker.error'),
        t('speaker.saveError'),
        [{ text: t('common:ok') }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  const renderInfoCard = () => (
    <View style={styles.infoCard}>
      <Text style={styles.infoTitle}>{t('speaker.templateGuide')}</Text>
      <Text style={styles.infoText}>{t('speaker.templateGuideText')}</Text>
      <View style={styles.templateVariables}>
        <Text style={styles.variableItem}>{'{{amount}}'} - {t('speaker.amount')}</Text>
        <Text style={styles.variableItem}>{'{{sender}}'} - {t('speaker.sender')}</Text>
        <Text style={styles.variableItem}>{'{{time}}'} - {t('speaker.time')}</Text>
        <Text style={styles.variableItem}>{'{{bankName}}'} - {t('speaker.bankName')}</Text>
      </View>
    </View>
  );

  // Settings menu items
  const settingsItems = [
    {
      id: 'enable-speaker',
      title: t('speaker.enableSpeaker'),
      subtitle: t('speaker.enableSpeakerDescription'),
      icon: <HugeiconsIcon icon={Megaphone01Icon} size={24} color={colors.primary} />,
      onPress: () => handleToggleEnabled(!settings.enabled),
      showToggle: true,
      toggleValue: settings.enabled,
      onToggle: handleToggleEnabled,
    },
    {
      id: 'background-notification',
      title: t('speaker.backgroundNotification'),
      subtitle: t('speaker.backgroundNotificationDescription'),
      icon: <HugeiconsIcon icon={VolumeHighIcon} size={24} color={colors.primary} />,
      onPress: () => handleToggleBackground(!settings.backgroundEnabled),
      showToggle: true,
      toggleValue: settings.backgroundEnabled,
      onToggle: handleToggleBackground,
      disabled: !settings.enabled,
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor='transparent' />
      <BackgroundPattern />

      <ScreenHeader title={t('speaker.title')} showBack />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Settings Section */}
        <MenuSection
          // title={t('speaker.settings')}
          items={settingsItems}
        />

        {/* Template Guide */}
        <View style={styles.infoCardContainer}>
          {renderInfoCard()}
        </View>

        {/* Message Template */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('speaker.messageTemplate')}</Text>
          <TextInput
            style={styles.textInput}
            value={settings.messageTemplate}
            onChangeText={handleMessageTemplateChange}
            placeholder={t('speaker.messageTemplatePlaceholder')}
            placeholderTextColor={colors.text.secondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={settings.enabled}
          />
        </View>

        {/* Actions Container */}
        <View style={styles.actionsContainer}>
          {/* Test Button */}
          <TouchableOpacity
            style={[styles.testButton, (!settings.enabled || isTesting) && styles.buttonDisabled]}
            onPress={handleTestSpeaker}
            disabled={!settings.enabled || isTesting}
            activeOpacity={0.7}
          >
            <Text style={styles.testButtonText}>
              {isTesting ? t('speaker.testing') : t('speaker.testSpeaker')}
            </Text>
          </TouchableOpacity>

          {/* Language Settings Info */}
          <View style={styles.languageInfo}>
            <Text style={styles.languageInfoText}>{t('speaker.languageInfo')}</Text>
            <Text style={styles.languageInfoSubtext}>{t('speaker.languageInfoDetail')}</Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.7}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? t('speaker.saving') : t('speaker.save')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  actionsContainer: {
    marginHorizontal: spacing.lg,
  },
  section: {
    backgroundColor: colors.light,
    borderRadius: 12,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,

    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  textInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
  },
  infoCardContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  infoCard: {
    backgroundColor: colors.info + '15',
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.info + '30',
  },
  infoTitle: {
    fontSize: 15,

    color: colors.info,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: 13,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  templateVariables: {
    gap: spacing.xs,
  },
  variableItem: {
    fontSize: 13,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.primary,
    lineHeight: 20,
  },
  testButton: {
    backgroundColor: colors.info,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingVertical: spacing.xl
  },
  testButtonText: {
    fontSize: 16,

    color: colors.light,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.xl
  },
  saveButtonText: {
    fontSize: 16,

    color: colors.light,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  languageInfo: {
    backgroundColor: colors.warning + '15',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  languageInfoText: {
    fontSize: 14,

    color: colors.warning,
    marginBottom: spacing.xs,
  },
  languageInfoSubtext: {
    fontSize: 12,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
    lineHeight: 16,
  },
});

export default SpeakerNotificationSettingsScreen;
