import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Text from '@/shared/components/base/Text';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, spacing, FONT_WEIGHTS, getFontFamily } from '@/shared/themes';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation';

interface TermsCheckboxProps {
  checked: boolean;
  onToggle: (checked: boolean) => void;
  checkmarkColor?: string;
  linkColor?: string;
}

export const TermsCheckbox: React.FC<TermsCheckboxProps> = ({ 
  checked, 
  onToggle, 
  checkmarkColor = colors.primary,
  linkColor = colors.primary 
}) => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handlePolicyPress = () => {
    navigation.navigate('Policy');
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => onToggle(!checked)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, checked && styles.checkedCheckbox]}>
          {checked && <View style={[styles.checkmark, { backgroundColor: checkmarkColor }]} />}
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => { handlePolicyPress() }}>
        <View style={styles.textContainer}>
          <Text style={styles.text}>
            {t('signup:terms.text')}{' '}
            <Text style={[styles.linkText, { color: linkColor }]}>
              {t('signup:terms.termsAndConditions')}
            </Text>
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
  },
  checkboxContainer: {
    alignItems: 'flex-start',
    padding: spacing.sm,
    justifyContent: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: colors.text.secondary,
    borderRadius: 4,
    backgroundColor: colors.light,
    alignItems: 'center',
    justifyContent: 'center',

  },
  checkedCheckbox: {
    // Keep same style as unchecked for consistency with AutoLoginCheckbox
  },
  checkmark: {
    width: 12,
    height: 12,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  textContainer: {
    flex: 1,
    paddingRight: spacing.lg * 2,
  },
  text: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    fontFamily: getFontFamily(),
  },
  linkText: {
    color: colors.primary,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },
});
