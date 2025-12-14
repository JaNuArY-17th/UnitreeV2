import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Text from '@/shared/components/base/Text';
import { setLanguage } from '@/shared/config/i18n';
import { colors, FONT_WEIGHTS, getFontFamily, spacing } from '@/shared/themes';
import { useTranslation } from 'react-i18next';

interface LanguageSwitcherProps {
  backgroundColor?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ backgroundColor }) => {
  const { i18n } = useTranslation();
  const current = (i18n.language || 'vi').split('-')[0] as 'en' | 'vi';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          styles.leftButton,
          current === 'en' ? [styles.selectedButton, { backgroundColor: backgroundColor }] : styles.unselectedButton,
        ]}
        onPress={() => setLanguage('en')}
      >
        <Text style={styles.flagText}>🇺🇸</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          styles.rightButton,
          current === 'vi' ? [styles.selectedButton, { backgroundColor: backgroundColor }] : styles.unselectedButton,
        ]}
        onPress={() => setLanguage('vi')}
      >
        <Text style={styles.flagText}>🇻🇳</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 100,
    backgroundColor: colors.lightGray,
    padding: spacing.xs,
    width: 100,
  },
  button: {
    flex: 1,
    // paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftButton: {
    borderTopLeftRadius: 100,
    borderBottomLeftRadius: 100,
  },
  rightButton: {
    borderTopRightRadius: 100,
    borderBottomRightRadius: 100,
  },
  selectedButton: {
    borderRadius: 100,
  },
  unselectedButton: {
    backgroundColor: 'transparent',
  },
  flagText: {
    fontSize: 20,
    lineHeight: 28,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  buttonText: {
    fontSize: 12,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },
  selectedText: {
    color: '#FFFFFF',
  },
  unselectedText: {
    color: colors.text.secondary,
  },
});

export default LanguageSwitcher;
