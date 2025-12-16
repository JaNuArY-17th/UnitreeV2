import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from '@/shared/components/base/Text';
import { colors } from '@/shared/themes/colors';
import { dimensions } from '@/shared/themes/dimensions';
import typographyStyles from '@/shared/themes/typography';
import { useTranslation } from 'react-i18next';

interface RememberForgotRowProps {
  rememberMe: boolean;
  onRememberMeChange: (value: boolean) => void;
  onForgotPassword: () => void;
}

const RememberForgotRow: React.FC<RememberForgotRowProps> = ({
  rememberMe,
  onRememberMeChange,
  onForgotPassword,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.rememberMeContainer}
        onPress={() => onRememberMeChange(!rememberMe)}
        activeOpacity={0.7}
      >
          <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
            {rememberMe && <View style={[styles.checkmark, { backgroundColor: colors.light }]} />}
          </View>
        <Text style={styles.rememberMeText}>{t('login:remember_me')}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onForgotPassword}>
        <Text style={styles.forgotPasswordText}>{t('login:forgot_password')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: dimensions.spacing.lg,
    paddingHorizontal: dimensions.spacing.sm,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberMeText: {
    ...typographyStyles.body,
    color: colors.text.light,
  },
  forgotPasswordText: {
    ...typographyStyles.body,
    color: colors.text.light,
    textDecorationLine: 'underline',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: colors.light,
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  checkboxChecked: {
  },
  checkmark: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
});

export default RememberForgotRow;
