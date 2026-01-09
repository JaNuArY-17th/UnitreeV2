import React, { useState, useRef } from 'react';
import { View, StyleSheet, TextInput, Pressable, Keyboard, Platform } from 'react-native';
import { colors, spacing } from '@/shared/themes';
import { MessageCircle } from '@/shared/assets/icons';
import Text from '@/shared/components/base/Text';

const Composer: React.FC<{ onSend: (text: string) => void }> = ({ onSend }) => {
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput | null>(null);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
    // ensure keyboard remains when appropriate
    if (Platform.OS === 'ios') {
      inputRef.current?.blur();
      inputRef.current?.focus();
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        placeholder="Nhập tin nhắn..."
        value={text}
        onChangeText={setText}
        multiline
        style={styles.input}
        onSubmitEditing={() => handleSend()}
        blurOnSubmit={false}
      />

      <Pressable onPress={handleSend} style={styles.sendButton} testID="send-button">
        <MessageCircle width={20} height={20} color={colors.light} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 140,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    backgroundColor: colors.light,
    color: colors.text.primary,
  },
  sendButton: {
    marginLeft: spacing.sm,
    backgroundColor: colors.primary,
    padding: spacing.sm,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Composer;