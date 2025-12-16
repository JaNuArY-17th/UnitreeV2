import React from 'react';
import { StyleSheet } from 'react-native';
import Button from '@/shared/components/base/Button';
import { colors } from '@/shared/themes/colors';
import { dimensions } from '@/shared/themes/dimensions';
import typographyStyles from '@/shared/themes/typography';
import { Login } from '../../../../shared/assets';

interface LoginButtonProps {
  onPress: () => void;
  loading?: boolean;
}

const LoginButton: React.FC<LoginButtonProps> = ({ onPress, loading = false }) => {
  return (
    <Button
      label={loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      onPress={onPress}
      disabled={loading}
      style={styles.button}
      textStyle={styles.buttonText}
      size='lg'
      variant='primary'
      leftIcon={ Login({ width: 24, height: 24, color: colors.text.light }) }
    />
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primaryDark,
    borderRadius: dimensions.radius.round,
    alignItems: 'center',
    marginBottom: dimensions.spacing.md,
    borderWidth: 0.5
  },
  buttonText: {
    ...typographyStyles.subtitle,
    color: colors.text.light,
  },
});

export default LoginButton;
