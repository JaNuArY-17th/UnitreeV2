import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, FONT_WEIGHTS, getFontFamily, spacing, typography } from '@/shared/themes';
import { ImportIcon, HistoryIcon, AdvanceIcon, ExportIcon } from '@/shared/assets/icons';

export type QuickActionType = 'deposit' | 'transfer' | 'history' | 'advance' | 'withdraw';

interface QuickActionsProps {
  onActionPress: (action: QuickActionType) => void;
}

export function QuickActions({ onActionPress }: QuickActionsProps) {
  const { t } = useTranslation();
  const [showDevelopmentModal, setShowDevelopmentModal] = useState(false);

  const ACTIONS: { id: QuickActionType; name: string; IconComponent: React.ComponentType<any> }[] = [
    { id: 'deposit', name: t('assets.quickActions.deposit'), IconComponent: ImportIcon },
    { id: 'withdraw', name: t('assets.quickActions.withdraw'), IconComponent: ExportIcon },
    { id: 'history', name: t('assets.quickActions.history'), IconComponent: HistoryIcon },
    { id: 'advance', name: t('assets.quickActions.advance'), IconComponent: AdvanceIcon },
  ];

  const handleActionPress = (action: QuickActionType) => {
    if (action === 'advance' || action === 'transfer') {
      setShowDevelopmentModal(true);
    } else {
      onActionPress(action);
    }
  };

  return (
    <>
      <View style={styles.container}>
        {ACTIONS.map(action => (
          <TouchableOpacity
            key={action.id}
            style={styles.button}
            onPress={() => handleActionPress(action.id)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <action.IconComponent width={24} height={24} color={colors.primary} />
            </View>
            <Text style={styles.label}>{action.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Development Modal */}
      <Modal
        visible={showDevelopmentModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDevelopmentModal(false)}
        statusBarTranslucent={true}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDevelopmentModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('assets.inDevelopment')}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowDevelopmentModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.background,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: spacing.sm,
    paddingVertical: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  button: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    ...typography.caption,
    color: colors.text.primary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    ...typography.subtitle,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.sm,
  },
  modalButtonText: {
    ...typography.body,
    color: colors.light,
  },
});
