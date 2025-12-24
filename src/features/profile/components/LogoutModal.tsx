import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Text } from '@/shared/components';
import { colors, spacing, dimensions, typography } from '@/shared/themes';

interface LogoutModalProps {
  visible: boolean;
  isLoading?: boolean;
  onCancel: () => void;
  onLogout: () => void | Promise<void>;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  visible,
  isLoading = false,
  onCancel,
  onLogout,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Logout</Text>
          <Text style={styles.modalMessage}>
            Are you sure you want to logout?
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onCancel}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.logoutButton, isLoading && styles.logoutButtonDisabled]}
              onPress={onLogout}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.light} />
              ) : (
                <Text style={styles.logoutButtonText}>Logout</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.lg,
    padding: spacing.lg,
    maxWidth: 400,
    width: '80%',
  },
  modalTitle: {
    ...typography.h1,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  modalMessage: {
    ...typography.subtitle,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: dimensions.radius.md,
    marginLeft: spacing.md,
  },
  cancelButton: {
    backgroundColor: colors.text.light,
  },
  cancelButtonText: {
    ...typography.subtitle,
    fontWeight: '500',
    color: colors.text.primary,
  },
  logoutButton: {
    backgroundColor: '#FFA79D',
  },
  logoutButtonDisabled: {
    opacity: 0.7,
  },
  logoutButtonText: {
    ...typography.subtitle,
    fontWeight: 'bold',
    color: colors.light,
  },
});
