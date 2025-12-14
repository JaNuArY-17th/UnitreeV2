import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Text from '@/shared/components/base/Text';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, dimensions, typography } from '@/shared/themes';
import { getColors, updateColorsForAccountType } from '@/shared/themes/colors';

const ACCOUNT_TYPE_STORAGE_KEY = '@account_type';

const getUserTypeColor = (userType: 'store' | 'user') => {
  const accountType = userType === 'store' ? 'STORE' : 'USER';
  return getColors(accountType).primary;
};

interface UserTypeSelectorProps {
  onTypeChange?: (type: 'store' | 'user') => void;
  selectedType?: 'store' | 'user';
}

export const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({ onTypeChange, selectedType = 'store' }) => {
  const { t } = useTranslation();

  const handleSelect = async (type: 'store' | 'user') => {
    onTypeChange?.(type);

    try {
      const accountType = type === 'store' ? 'STORE' : 'USER';
      await AsyncStorage.setItem(ACCOUNT_TYPE_STORAGE_KEY, accountType);
      updateColorsForAccountType(accountType);
    } catch (error) {
      console.warn('Failed to save account type to storage:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          styles.leftButton,
          selectedType === 'store' ? [styles.selectedButton, { backgroundColor: getUserTypeColor('store') }] : styles.unselectedButton,
        ]}
        onPress={() => handleSelect('store')}
      >
        <Text
          style={[
            styles.buttonText,
            selectedType === 'store' ? styles.selectedText : styles.unselectedText,
          ]}
        >
          {t('login:userType.store')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          styles.rightButton,
          selectedType === 'user' ? [styles.selectedButton, { backgroundColor: getUserTypeColor('user') }] : styles.unselectedButton,
        ]}
        onPress={() => handleSelect('user')}
      >
        <Text
          style={[
            styles.buttonText,
            selectedType === 'user' ? styles.selectedText : styles.unselectedText,
          ]}
        >
          {t('login:userType.user')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 100,
    backgroundColor: colors.lightGray,
    padding: dimensions.spacing.xs,
    marginHorizontal: dimensions.spacing.xxl * 2,
  },
  button: {
    flex: 1,
    paddingVertical: dimensions.spacing.md,
    paddingHorizontal: dimensions.spacing.xs,
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
  buttonText: {
    ...typography.body,
  },
  selectedText: {
    color: colors.light,
  },
  unselectedText: {
    color: colors.text.secondary,
  },
});
