import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/themes';
import { Flash, ArrowRight } from '@/shared/assets/icons';
import { useTranslation } from 'react-i18next';

interface PointsRedeemBarProps {
  points: number;
  onRedeemPress?: () => void;
}

export const PointsRedeemBar: React.FC<PointsRedeemBarProps> = ({
  points,
  onRedeemPress,
}) => {
  const { t } = useTranslation('wifi');

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.lightningIcon}>
          <Flash width={28} height={28} color="#FFD700" />
        </View>
        <View style={styles.pointsInfo}>
          <Text style={styles.pointsValue}>{points} Points</Text>
          <Text style={styles.pointsLabel}>Earned this session</Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.redeemButton}
        onPress={onRedeemPress}
        activeOpacity={0.8}
      >
        <Text style={styles.redeemText}>Redeem</Text>
        <ArrowRight width={20} height={20} color="#000" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2C2C2C',
    borderRadius: 30,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  lightningIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointsInfo: {
    flex: 1,
  },
  pointsValue: {
    ...typography.subtitle,
    color: '#FFFFFF',
  },
  pointsLabel: {
    ...typography.caption,
    color: '#A0A0A0',
    marginTop: 2,
  },
  redeemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 25,
    gap: spacing.xs,
  },
  redeemText: {
    ...typography.subtitle,
    color: '#000000',
  },
});
