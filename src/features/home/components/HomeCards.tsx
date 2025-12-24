import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Text } from '@/shared/components';
import { colors, spacing, dimensions, typography } from '@/shared/themes';
import { t } from 'i18next';

type RootStackParamList = {
  points: undefined;
  trees: undefined;
  profile: undefined;
  wifi: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface CardProps {
  icon: string;
  title: string;
  value: string | number;
  subtitle?: string;
  onPress: () => void;
  iconColor?: string;
  valueColor?: string;
}

const Card: React.FC<CardProps> = ({
  icon,
  title,
  value,
  subtitle,
  onPress,
  iconColor = colors.success,
  valueColor = colors.success,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Icon name={icon} size={24} color={iconColor} />
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={styles.cardArrow}>
          <Icon name="chevron-right" size={20} color={colors.text.secondary} />
        </View>
      </View>
      <Text style={[styles.cardValue, { color: valueColor }]}>
        {value}
      </Text>
      {subtitle && (
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      )}
    </TouchableOpacity>
  );
};

interface PointsCardProps {
  points: number;
  onPress: () => void;
}

export const PointsCard: React.FC<PointsCardProps> = ({ points, onPress }) => {
  return (
    <Card
      icon="star"
      title="Available Points"
      value={points}
      onPress={onPress}
    />
  );
};

interface WiFiStatusCardProps {
  isConnected: boolean;
  onPress: () => void;
}

export const WiFiStatusCard: React.FC<WiFiStatusCardProps> = ({ isConnected, onPress }) => {
  return (
    <Card
      icon={isConnected ? 'wifi' : 'wifi-off'}
      title="WiFi Status"
      value={isConnected ? 'Connected' : 'Disconnected'}
      subtitle={isConnected ? undefined : 'Tap to view WiFi details'}
      onPress={onPress}
      iconColor={isConnected ? colors.success : colors.danger}
      valueColor={isConnected ? colors.success : colors.danger}
    />
  );
};

interface TreesCardProps {
  count: number;
  co2Reduced: number;
  onPress: () => void;
}

export const TreesCard: React.FC<TreesCardProps> = ({ count, co2Reduced, onPress }) => {
  return (
    <Card
      icon="tree"
      title="Trees Planted"
      value={count}
      subtitle={`You've helped reduce CO₂ by approximately ${co2Reduced}kg per year!`}
      onPress={onPress}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.h2,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginLeft: spacing.xs,
    flex: 1,
  },
  cardValue: {
    ...typography.h0,
    fontWeight: 'bold',
    marginVertical: spacing.md,
  },
  cardSubtitle: {
    ...typography.subtitle,
    color: colors.text.secondary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  cardArrow: {
    marginLeft: 'auto',
  },
});
