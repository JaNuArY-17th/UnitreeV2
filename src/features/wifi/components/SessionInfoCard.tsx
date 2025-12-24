import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/themes';
import { AnimatedWaterCircle } from './AnimatedWaterCircle';
import { Wifi, Clock, Star, BarChart } from '@/shared/assets/icons';
import { useTranslation } from 'react-i18next';

interface SessionInfoCardProps {
  timeConnected: string;
  networkName: string;
  signalStrength: number;
  speed: string;
  pointsEarned: number;
  onEndSession?: () => void;
  onViewStatistics?: () => void;
}

export const SessionInfoCard: React.FC<SessionInfoCardProps> = ({
  timeConnected,
  networkName,
  signalStrength,
  speed,
  pointsEarned,
  onEndSession,
  onViewStatistics,
}) => {
  const { t } = useTranslation('wifi');

  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{t('session.current')}</Text>

      {/* Animated Water Circle */}
      <View style={styles.animationWrapper}>
        <AnimatedWaterCircle
          timeDisplay={timeConnected}
          timeLabel={t('session.timeConnected')}
        />
      </View>

      {/* Network Info */}
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <View style={styles.infoLeft}>
            <Wifi width={20} height={20} color={colors.text.primary} />
            <Text style={styles.infoLabel}>{t('info.connectedNetwork')}</Text>
          </View>
          <Text style={styles.infoValue}>{networkName}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoLeft}>
            <Wifi width={20} height={20} color={colors.text.primary} />
            <Text style={styles.infoLabel}>{t('info.signalStrength')}</Text>
          </View>
          <View style={styles.signalContainer}>
            <View style={styles.signalBar}>
              <View
                style={[styles.signalFill, { width: `${signalStrength}%` }]}
              />
            </View>
            <Text style={styles.infoValue}>{signalStrength}%</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoLeft}>
            <Clock width={20} height={20} color={colors.text.primary} />
            <Text style={styles.infoLabel}>{t('info.speed')}</Text>
          </View>
          <Text style={styles.infoValue}>{speed}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoLeft}>
            <Star width={20} height={20} color={colors.primary} />
            <Text style={styles.infoLabel}>{t('info.pointsEarned')}</Text>
          </View>
          <Text style={[styles.infoValue, { color: colors.primary }]}>
            +{pointsEarned}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.endSessionBtn}
          onPress={onEndSession}
          activeOpacity={0.8}
        >
          <Clock width={18} height={18} color={colors.primary} />
          <Text style={styles.endSessionText}>{t('session.endSession')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.detailsBtn}
          onPress={onViewStatistics}
          activeOpacity={0.8}
        >
          <BarChart width={18} height={18} color={colors.text.primary} />
          <Text style={styles.detailsText}>{t('session.viewStatistics')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  cardLabel: {
    ...typography.bodySmall,
    marginBottom: spacing.md,
    opacity: 0.8,
  },
  animationWrapper: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  infoContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: spacing.md,
    marginVertical: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  infoLabel: {
    ...typography.bodySmall,
    opacity: 0.8,
  },
  infoValue: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  signalBar: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  signalFill: {
    height: '100%',
    backgroundColor: colors.text.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  endSessionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.text.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  endSessionText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  // detailsBtn: {
  //   ...typography.bodySmall,
  //   color: colors.primary,
  // },
  detailsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.text.primary,
  },
  detailsText: {
    ...typography.bodySmall
  },
});