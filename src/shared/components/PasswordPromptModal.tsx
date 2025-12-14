import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, spacing, shadows } from '@/shared/themes';
import { Heading, Body, Button, Input } from '@/shared/components/base';

interface PasswordPromptModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  confirming?: boolean;
  onConfirm: (password: string) => Promise<void> | void;
  onCancel: () => void;
  error?: string | null;
}

const PasswordPromptModal: React.FC<PasswordPromptModalProps> = ({
  visible,
  title = 'Confirm Password',
  message = 'Enter your current password to continue',
  confirming = false,
  onConfirm,
  onCancel,
  error,
}) => {
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setPassword('');
      setLocalError(null);
    }
  }, [visible]);

  const handleConfirm = async () => {
    if (!password.trim()) {
      setLocalError('Password required');
      return;
    }
    try {
      await onConfirm(password);
    } catch (e: any) {
      setLocalError(e.message || 'Failed');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.center}>
          <Pressable style={styles.card} onPress={() => {}}>
            <Heading level={3} style={styles.title}>{title}</Heading>
            <Body style={styles.message}>{message}</Body>
            <Input
              value={password}
              onChangeText={text => { setPassword(text); if (localError) setLocalError(null); }}
              placeholder="Password"
              secure
              // style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
            />
            {(localError || error) && <Body style={styles.error}>{localError || error}</Body>}
            <View style={styles.actions}>
              <Button label="Cancel" variant="outline" style={styles.button} onPress={onCancel} disabled={confirming} />
              <Button label={confirming ? 'Please wait...' : 'Confirm'} onPress={handleConfirm} style={styles.button} disabled={confirming} />
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    backgroundColor: colors.light,
    borderRadius: 16,
    padding: spacing.xl,
    ...shadows.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    textAlign: 'center',
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text.primary,
  },
  error: {
    color: colors.danger,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  button: { flex: 1 },
});

export default PasswordPromptModal;
