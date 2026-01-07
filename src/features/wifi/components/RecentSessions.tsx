import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/themes';
import { Clock, Flash } from '@/shared/assets/icons';
import { useTranslation } from 'react-i18next';

export interface WifiSession {
  id: string;
  networkName: string;
  duration: string;
  points: number;
  date: string;
  timestamp: Date;
}

interface RecentSessionsProps {
  sessions?: WifiSession[];
  maxItems?: number;
}

const MOCK_SESSIONS: WifiSession[] = [
  {
    id: '1',
    networkName: 'Home_Network_5G',
    duration: '2h 15m',
    points: 135,
    date: 'Hôm nay, 14:30',
    timestamp: new Date(),
  },
  {
    id: '2',
    networkName: 'Office_WiFi',
    duration: '4h 45m',
    points: 285,
    date: 'Hôm qua, 09:00',
    timestamp: new Date(Date.now() - 86400000),
  },
  {
    id: '3',
    networkName: 'Coffee_Shop_Free',
    duration: '1h 30m',
    points: 90,
    date: '25/12, 16:20',
    timestamp: new Date(Date.now() - 172800000),
  },
  {
    id: '4',
    networkName: 'Home_Network_5G',
    duration: '3h 00m',
    points: 180,
    date: '24/12, 20:15',
    timestamp: new Date(Date.now() - 259200000),
  },
];

export const RecentSessions: React.FC<RecentSessionsProps> = ({
  sessions = MOCK_SESSIONS,
  maxItems = 5,
  
}) => {
  const { t } = useTranslation('wifi');

  const renderSession = ({ item }: { item: WifiSession }) => (
    <View style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <Text style={styles.networkName}>{item.networkName}</Text>
        <Text style={styles.dateText}>{item.date}</Text>
      </View>
      
      <View style={styles.sessionStats}>
        <View style={styles.statItem}>
          <Clock width={16} height={16} color={colors.gray[500]} />
          <Text style={styles.statText}>{item.duration}</Text>
        </View>
        
        <View style={styles.pointsSection}>
          <Flash width={16} height={16} color="#FFD700" />
          <Text style={styles.pointsText}>+{item.points}</Text>
        </View>
      </View>
    </View>
  );

  const displaySessions = sessions.slice(0, maxItems);

  if (displaySessions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Phiên gần đây</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Chưa có phiên kết nối nào</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Phiên gần đây</Text>
        {sessions.length > maxItems && (
          <Text style={styles.viewAll}>Xem tất cả ({sessions.length})</Text>
        )}
      </View>
      
      <FlatList
        data={displaySessions}
        renderItem={renderSession}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.gray,
  },
  viewAll: {
    ...typography.subtitle,
    color: colors.primary,
  },
  sessionCard: {
    backgroundColor: colors.light,
    borderRadius: 16,
    padding: spacing.md,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  networkName: {
    ...typography.subtitle,
    color: colors.gray,
    flex: 1,
  },
  dateText: {
    ...typography.caption,
    color: colors.gray,
    marginLeft: spacing.sm,
  },
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    ...typography.caption,
    color: colors.gray,
    marginLeft: spacing.xs,
  },
  pointsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
    gap: spacing.xs,
  },
  pointsText: {
    ...typography.caption,
    color: '#F59E0B',
    marginLeft: spacing.xs / 2,
  },
  separator: {
    height: spacing.sm,
  },
  emptyState: {
    backgroundColor: colors.light,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...typography.subtitle,
    color: colors.gray,
    textAlign: 'center',
  },
});
