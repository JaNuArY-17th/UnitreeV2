import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, dimensions, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';
import { Text, Button } from '@/shared/components/base';

export interface EditFieldModalProps {
  visible: boolean;
  title: string;
  value: string;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  multiline?: boolean;
  onSave: (value: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const EditFieldModal: React.FC<EditFieldModalProps> = ({
  visible,
  title,
  value,
  placeholder = '',
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  maxLength,
  multiline = false,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const insets = useSafeAreaInsets();
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    if (visible) {
      setInputValue(value);
    }
  }, [visible, value]);

  const handleSave = () => {
    onSave(inputValue.trim());
  };

  const handleCancel = () => {
    setInputValue(value); // Reset to original value
    onCancel();
  };

  const isValueChanged = inputValue.trim() !== value.trim();
  const canSave = inputValue.trim().length > 0 && isValueChanged;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleCancel}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={handleCancel}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
              </View>

              {/* Input Field */}
              <View style={styles.inputSection}>
                <TextInput
                  style={[
                    styles.input,
                    multiline && styles.multilineInput,
                  ]}
                  value={inputValue}
                  onChangeText={setInputValue}
                  placeholder={placeholder}
                  placeholderTextColor={colors.text.secondary}
                  keyboardType={keyboardType}
                  autoCapitalize={autoCapitalize}
                  maxLength={maxLength}
                  multiline={multiline}
                  numberOfLines={multiline ? 4 : 1}
                  autoFocus
                  selectTextOnFocus
                  scrollEnabled={multiline}
                />
                {maxLength && (
                  <Text style={styles.characterCount}>
                    {inputValue.length}/{maxLength}
                  </Text>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonSection}>
                <Button
                  label="Cancel"
                  variant="secondary"
                  size="md"
                  onPress={handleCancel}
                  disabled={isLoading}
                  style={styles.cancelButton}
                />
                <Button
                  label={isLoading ? 'Saving...' : 'Save'}
                  variant="primary"
                  size="md"
                  onPress={handleSave}
                  disabled={!canSave || isLoading}
                  style={styles.saveButton}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: colors.light,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    // elevation: 8,
  },
  modalContent: {
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 18,

    color: colors.text.primary,
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text.primary,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 48,
  },
  multilineInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'right',
    marginTop: spacing.xs,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
  },
  buttonSection: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});

export default EditFieldModal;
