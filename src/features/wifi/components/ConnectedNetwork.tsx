import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/themes';
import { CheckCircle } from '@/shared/assets/icons';
import { useTranslation } from 'react-i18next';

interface ConnectedNetworkProps {
  networkName: string;
  isConnected?: boolean;
}

export const ConnectedNetwork: React.FC<ConnectedNetworkProps> = ({
  networkName,
  isConnected = true,
}) => {
  const { t } = useTranslation('wifi');

  return (
    <View style={styles.container}>
      <Text style={styles.label}>CONNECTED TO</Text>
      <View style={styles.networkCard}>
        {isConnected && (
          <CheckCircle width={24} height={24} color="#4CAF50" />
        )}
        <Text style={styles.networkName}>{networkName}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  networkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 16,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  networkName: {
    ...typography.subtitle,
  },
});
