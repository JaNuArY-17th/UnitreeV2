import React from 'react';
import { View, StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Text from '@/shared/components/base/Text';
import { colors } from '@/shared/themes/colors';
import { typography } from '../../../../shared/themes';
import { dimensions } from '@/shared/themes/dimensions';
import typographyStyles from '@/shared/themes/typography';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

interface FormContainerProps {
  title: string;
  children: React.ReactNode;
  onSignUp?: () => void;
}

const FormContainer: React.FC<FormContainerProps> = ({
  title,
  children,
  onSignUp,
}) => {
  const { t } = useTranslation();

  return (
    <Animated.View
      entering={FadeInUp.delay(400)}
      style={styles.container}
    >
      <Text style={styles.title}>{title}</Text>

      <View style={styles.formContent}>
        {children}
      </View>

      {onSignUp && (
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>{t('login:dont_have_account')} </Text>
          <TouchableOpacity onPress={onSignUp}>
            <Text style={styles.signUpLink}>{t('login:sign_up')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    borderTopLeftRadius: dimensions.radius.xxl,
    borderTopRightRadius: dimensions.radius.xxl,
    paddingHorizontal: dimensions.spacing.lg,
    paddingTop: dimensions.spacing.xxl,
    paddingBottom: dimensions.spacing.lg,
    overflow: 'visible',
    position: 'absolute',
    top: -30,
    width: '100%',
    height: '200%',
    zIndex: 998,
  },
  title: {
    ...typography.h0,
    fontSize: dimensions.fontSize.xxl * 2,
    color: colors.text.light,
    lineHeight: dimensions.fontSize.xxxl * 2,
  },
  formContent: {
    marginTop: dimensions.spacing.lg,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    ...typographyStyles.body,
    color: colors.text.light,
  },
  signUpLink: {
    ...typographyStyles.body,
    color: colors.text.light,
    textDecorationLine: 'underline',
  },
});

export default FormContainer;
