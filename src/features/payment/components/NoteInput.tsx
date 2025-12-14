import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Keyboard } from 'react-native';
import { colors, spacing, dimensions, typography, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';
import type { QuickNote } from '../types/transfer';

interface NoteInputProps {
  note: string;
  onNoteChange: (note: string) => void;
  placeholder: string;
  quickNotes: QuickNote[][];
  isNoteInputFocused: boolean;
  onNoteInputFocus: (focused: boolean) => void;
  noteInputRef: React.RefObject<TextInput | null>;
  showQuickNotes?: boolean;
  editable?: boolean;
  label?: string;
}

export const NoteInput: React.FC<NoteInputProps> = ({
  note,
  onNoteChange,
  placeholder,
  quickNotes,
  isNoteInputFocused,
  onNoteInputFocus,
  noteInputRef,
  showQuickNotes = true,
  editable = true,
  label,
}) => {
  const handleNoteSelect = (selectedNote: string) => {
    // Dismiss keyboard first to ensure single-click interaction
    Keyboard.dismiss();
    // Update note value
    onNoteChange(selectedNote);
    // Update focus state
    onNoteInputFocus(false);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}

      <View style={[styles.inputContainer, !editable && styles.inputContainerDisabled]}>
        <TextInput
          ref={noteInputRef}
          style={[styles.input, !editable && styles.inputDisabled]}
          value={note}
          onChangeText={onNoteChange}
          placeholder={placeholder}
          placeholderTextColor={colors.text.secondary}
          onFocus={() => onNoteInputFocus(true)}
          maxLength={50}
          editable={editable}
        />
      </View>

      {showQuickNotes && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickNotesContainer}
        >
          <View style={styles.quickNotesRows}>
            {quickNotes.map((row, rowIndex) => (
              <View key={`row-${rowIndex}`} style={styles.quickNotesRow}>
                {row.map((quickNote) => (
                  <TouchableOpacity
                    key={quickNote.id}
                    style={styles.quickNoteTag}
                    onPress={() => handleNoteSelect(quickNote.text)}
                  >
                    <Text style={styles.quickNoteText}>{quickNote.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.md,
  },
  label: {
    ...typography.title,
    marginBottom: spacing.sm,
    textAlign: 'left',
    color: colors.text.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    // minHeight: 60,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.light,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray,
  },
  inputContainerDisabled: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  input: {
    ...typography.body,
    flex: 1,
    // fontSize: dimensions.fontSize.md,
    color: colors.text.primary,
    // padding: 0,
  },
  inputDisabled: {
    color: colors.text.secondary,
  },
  quickNotesContainer: {
    marginTop: spacing.sm,
  },
  quickNotesRows: {
    gap: spacing.sm,
  },
  quickNotesRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickNoteTag: {
    paddingVertical: spacing.sm,
    borderRadius: dimensions.radius.md,
  },
  quickNoteText: {
    ...typography.body,
    color: colors.primary,
  },
});
