import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing } from '@/shared/themes';
import { Body, Button } from '@/shared/components/base';

type Props = { errorMessage: string; onRetry: () => void };

const DepositError: React.FC<Props> = ({ errorMessage, onRetry }) => {
  return (
    <View style={styles.container}>
      <Body style={{ textAlign: 'center', marginBottom: spacing.md }}>{errorMessage}</Body>
      <Button label="Retry" variant="primary" onPress={onRetry} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
});

export default DepositError;
