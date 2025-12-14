import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, Switch, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { colors, spacing, typography } from '@/shared/themes';
import { ScreenHeader } from '@/shared/components';
import Text from '@/shared/components/base/Text';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Notification03Icon,
  Calendar03Icon,
  SecurityCheckIcon,
  CreditCardIcon,
  ArrowRight01Icon
} from '@hugeicons/core-free-icons';

const PostpaidSettingsScreen: React.FC = ({ navigation }: any) => {
  const { t } = useTranslation('account');
  const insets = useSafeAreaInsets();

  const [autoPayment, setAutoPayment] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const SettingItem = ({ icon, label, value, onPress, hasSwitch }: any) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={hasSwitch}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <HugeiconsIcon icon={icon} size={24} color={colors.text.secondary} />
        </View>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>

      {hasSwitch ? (
        <Switch
          value={value}
          onValueChange={onPress}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.light}
        />
      ) : (
        <View style={styles.settingRight}>
          {value && <Text style={styles.settingValue}>{value}</Text>}
          <HugeiconsIcon icon={ArrowRight01Icon} size={20} color={colors.text.secondary} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.primary }]} />
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <ScreenHeader
          title={t('postpaid.actions.settings') || 'Cài đặt'}
          titleStyle={{ color: colors.light }}
          backIconColor={colors.light}
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Thanh toán</Text>
        <View style={styles.section}>
          <SettingItem
            icon={CreditCardIcon}
            label="Tự động thanh toán"
            hasSwitch
            value={autoPayment}
            onPress={() => setAutoPayment(!autoPayment)}
          />
          <SettingItem
            icon={Calendar03Icon}
            label="Ngày thanh toán"
            value="Ngày 05 hàng tháng"
            onPress={() => { }}
          />
        </View>

        <Text style={styles.sectionTitle}>Thông báo & Bảo mật</Text>
        <View style={styles.section}>
          <SettingItem
            icon={Notification03Icon}
            label="Nhắc nhở thanh toán"
            hasSwitch
            value={notifications}
            onPress={() => setNotifications(!notifications)}
          />
          <SettingItem
            icon={SecurityCheckIcon}
            label="Hạn mức giao dịch"
            value="50.000.000 đ"
            onPress={() => { }}
          />
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>Khóa ví trả sau</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    paddingBottom: spacing.lg,
  },
  content: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  section: {
    backgroundColor: colors.light,
    borderRadius: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  settingLabel: {
    ...typography.body,
    fontWeight: '500',
    color: colors.text.primary,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    ...typography.body,
    color: colors.text.secondary,
    marginRight: spacing.sm,
  },
  logoutButton: {
    marginTop: spacing.xxl,
    backgroundColor: colors.light,
    padding: spacing.md,
    borderRadius: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  logoutText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.danger,
  },
});

export default PostpaidSettingsScreen;
