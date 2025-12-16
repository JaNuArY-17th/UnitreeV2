import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Text from '@/shared/components/base/Text';
import { dimensions, colors, typography } from '@/shared/themes';
import { useLanguage } from '@/shared/providers/LanguageProvider';

interface LanguageSwitcherProps {
  backgroundColor?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ backgroundColor }) => {
  const { currentLanguage, changeLanguage, isLoading } = useLanguage();

  const handleLanguageChange = async (language: 'en' | 'vi') => {
    if (currentLanguage !== language && !isLoading) {
      await changeLanguage(language);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        disabled={isLoading}
        style={[
          styles.button,
          styles.leftButton,
          currentLanguage === 'en' ? [styles.selectedButton, { backgroundColor: backgroundColor }] : styles.unselectedButton,
        ]}
        onPress={() => handleLanguageChange('en')}
      >
        <Text style={[currentLanguage === 'en' ? [styles.selectedText] : styles.flagText]}>En</Text>
      </TouchableOpacity>
      <TouchableOpacity
        disabled={isLoading}
        style={[
          styles.button,
          styles.rightButton,
          currentLanguage === 'vi' ? [styles.selectedButton, { backgroundColor: backgroundColor }] : styles.unselectedButton,
        ]}
        onPress={() => handleLanguageChange('vi')}
      >
        <Text style={[currentLanguage === 'vi' ? [styles.selectedText] : styles.flagText]}>Vi</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: dimensions.radius.round,
    backgroundColor: colors.background,
    padding: dimensions.spacing.xs,
    width: 80,
  },
  button: {
    flex: 1,
    paddingHorizontal: dimensions.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: dimensions.spacing.xs,
  },
  leftButton: {
    borderTopLeftRadius: dimensions.radius.round,
    borderBottomLeftRadius: dimensions.radius.round,
  },
  rightButton: {
    borderTopRightRadius: dimensions.radius.round,
    borderBottomRightRadius: dimensions.radius.round,
  },
  selectedButton: {
    borderRadius: dimensions.radius.round,
  },
  unselectedButton: {
    backgroundColor: 'transparent',
  },
  flagText: {
    ...typography.body,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: colors.primary,
    fontWeight: 'bold'
  },
  selectedText: {
    ...typography.body,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: colors.text.light,
    fontWeight: 'bold'
  }
});

export default LanguageSwitcher;
