import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Text } from '@/shared/components';
import { colors, spacing, dimensions, typography } from '@/shared/themes';

interface SettingsItem {
  id: string;
  icon: string;
  label: string;
  onPress: () => void;
}

interface SettingsCardProps {
  items: SettingsItem[];
  onLogoutPress?: () => void;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({
  items,
  onLogoutPress,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Settings</Text>

      {items.map((item, index) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.settingsItem,
            index === items.length - 1 && { borderBottomWidth: 0 },
          ]}
          onPress={item.onPress}
        >
          <View style={styles.settingsItemLeft}>
            <Icon name={item.icon} size={24} color={colors.success} />
            <Text style={styles.settingsItemText}>{item.label}</Text>
          </View>
          <Icon name="chevron-right" size={20} color={colors.text.secondary} />
        </TouchableOpacity>
      ))}

      {onLogoutPress && (
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={onLogoutPress}
        >
          <Icon name="logout" size={24} color="#FFA79D" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    ...typography.h1,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.text.light,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemText: {
    ...typography.subtitle,
    color: colors.text.primary,
    marginLeft: spacing.md,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    marginTop: spacing.lg,
    borderWidth: 2,
    borderColor: '#FFA79D',
    borderRadius: dimensions.radius.md,
  },
  logoutButtonText: {
    ...typography.subtitle,
    color: '#FFA79D',
    fontWeight: 'bold',
    marginLeft: spacing.sm,
  },
});
