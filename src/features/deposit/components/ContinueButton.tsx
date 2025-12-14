import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from '@/shared/components/base';
import { spacing } from '@/shared/themes';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
};

const ContinueButton: React.FC<Props> = ({ label, onPress, disabled, leftIcon }) => {
  return (
    <Button
      label={label}
      variant="primary"
      size="lg"
      fullWidth
      onPress={onPress}
      disabled={disabled}
      leftIcon={leftIcon}
    />
  );
};

const styles = StyleSheet.create({
  // wrap: { paddingHorizontal: spacing.xl },
});

export default ContinueButton;
