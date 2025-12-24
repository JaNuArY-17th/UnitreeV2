import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, colors } from '@/shared/themes';

const { width } = Dimensions.get('window');

interface UserStats {
  totalSessions: number;
  totalHours: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
}

interface SettingOption {
  id: string;
  title: string;
  value?: boolean;
  onToggle?: (value: boolean) => void;
  icon: string;
  subtitle?: string;
}

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const [userInfo] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    avatar: '👤',
    memberSince: 'Jan 2024',
  });

  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: false,
    autoRedeem: false,
    darkMode: false,
  });

  const stats: UserStats = {
    totalSessions: 156,
    totalHours: 242,
    totalPoints: 2450,
    currentStreak: 7,
    longestStreak: 21,
  };

  React.useEffect(() => {
    StatusBar.setBarStyle('dark-content');
  }, []);

  const handleSettingToggle = (key: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleEditProfile = () => {
    Alert.alert(
      'Edit Profile',
      'Redirect to profile editing screen',
      [{ text: 'OK' }]
    );
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'Redirect to password change screen',
      [{ text: 'OK' }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => {
            // Handle logout
          },
          style: 'destructive',
        },
      ]
    );
  };

  const settingsOptions: SettingOption[] = [
    {
      id: 'notifications',
      title: 'Push Notifications',
      value: settings.notifications,
      onToggle: (value) => handleSettingToggle('notifications', value),
      icon: '🔔',
      subtitle: 'Receive WiFi and points alerts',
    },
    {
      id: 'emailAlerts',
      title: 'Email Alerts',
      value: settings.emailAlerts,
      onToggle: (value) => handleSettingToggle('emailAlerts', value),
      icon: '📧',
      subtitle: 'Get daily summary emails',
    },
    {
      id: 'autoRedeem',
      title: 'Auto Redeem',
      value: settings.autoRedeem,
      onToggle: (value) => handleSettingToggle('autoRedeem', value),
      icon: '🤖',
      subtitle: 'Automatically redeem certain items',
    },
    {
      id: 'darkMode',
      title: 'Dark Mode',
      value: settings.darkMode,
      onToggle: (value) => handleSettingToggle('darkMode', value),
      icon: '🌙',
      subtitle: 'Easier on the eyes',
    },
  ];

  const menuOptions = [
    { id: 'edit', label: 'Edit Profile', emoji: '✏️', onPress: handleEditProfile },
    { id: 'password', label: 'Change Password', emoji: '🔐', onPress: handleChangePassword },
    { id: 'help', label: 'Help & Support', emoji: '❓', onPress: () => Alert.alert('Help') },
    { id: 'about', label: 'About App', emoji: 'ℹ️', onPress: () => Alert.alert('About App v1.0.0') },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
      >
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>{userInfo.avatar}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userInfo.name}</Text>
            <Text style={styles.userEmail}>{userInfo.email}</Text>
            <Text style={styles.memberSince}>
              Member since {userInfo.memberSince}
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Your Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>⏱️</Text>
              <Text style={styles.statValue}>{stats.totalHours}</Text>
              <Text style={styles.statLabel}>Total Hours</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>💎</Text>
              <Text style={styles.statValue}>{stats.totalPoints}</Text>
              <Text style={styles.statLabel}>Total Points</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>📊</Text>
              <Text style={styles.statValue}>{stats.totalSessions}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={styles.statValue}>{stats.currentStreak}</Text>
              <Text style={styles.statLabel}>Current Streak</Text>
            </View>
          </View>
        </View>

        {/* Achievement Banner */}
        <View style={styles.achievementBanner}>
          <View style={styles.achievementContent}>
            <Text style={styles.achievementEmoji}>🏆</Text>
            <View style={styles.achievementText}>
              <Text style={styles.achievementTitle}>You're on fire!</Text>
              <Text style={styles.achievementSubtext}>
                {stats.longestStreak} day longest streak achieved
              </Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          {settingsOptions.map((option) => (
            <View key={option.id} style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingEmoji}>{option.icon}</Text>
                <View style={styles.settingTextContent}>
                  <Text style={styles.settingTitle}>{option.title}</Text>
                  {option.subtitle && (
                    <Text style={styles.settingSubtitle}>
                      {option.subtitle}
                    </Text>
                  )}
                </View>
              </View>
              {option.onToggle && (
                <Switch
                  value={option.value}
                  onValueChange={option.onToggle}
                  trackColor={{ false: colors.border, true: colors.primaryLight }}
                  thumbColor={option.value ? colors.primary : colors.gray}
                />
              )}
            </View>
          ))}
        </View>

        {/* Menu Options */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          {menuOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.menuItem}
              onPress={option.onPress}
            >
              <Text style={styles.menuEmoji}>{option.emoji}</Text>
              <Text style={styles.menuLabel}>{option.label}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>WiFi Tracker v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  avatar: {
    fontSize: 36,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  memberSince: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  statsContainer: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  statCard: {
    width: (width - spacing.md * 2 - spacing.sm) / 2,
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  achievementBanner: {
    backgroundColor: colors.secondary,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    elevation: 2,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementEmoji: {
    fontSize: 40,
    marginRight: spacing.md,
  },
  achievementText: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  achievementSubtext: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  settingsSection: {
    marginBottom: spacing.lg,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingEmoji: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  settingTextContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  settingSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  menuSection: {
    marginBottom: spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuEmoji: {
    fontSize: 18,
    marginRight: spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  menuArrow: {
    fontSize: 18,
    color: colors.text.secondary,
    fontWeight: '400',
  },
  logoutButton: {
    backgroundColor: colors.danger,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoutButtonText: {
    color: colors.light,
    fontSize: 16,
    fontWeight: '700',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  versionText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
});

export default ProfileScreen;
