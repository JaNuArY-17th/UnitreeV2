import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/shared/themes';
import { MessageFlashList } from '../components/MessageFlashList';
import Composer from '../components/Composer';
import { useMessages } from '../hooks/useMessages';
import StickyDateHeader from '../components/StickyDateHeader';
import TypingIndicator from '../components/TypingIndicator';
import useKeyboardInsets from '../hooks/useKeyboardInsets';

export const ChatScreen: React.FC = () => {
  const { messages, sendMessage, generateMock, typing, setTyping, loadOlder, isLoadingOlder } = useMessages();
  const [topDate, setTopDate] = React.useState<string | undefined>(undefined);
  const { keyboardHeight } = useKeyboardInsets();

  React.useEffect(() => {
    // create a moderate mock dataset for local dev; can be scaled in perf tests
    generateMock(200);

    // demo: toggle typing indicator after 2s for a short demonstration
    const t1 = setTimeout(() => setTyping(true), 1200);
    const t2 = setTimeout(() => setTyping(false), 4000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <SafeAreaView style={styles.container} testID="chat-screen">
      <View style={[styles.listContainer]}>
        <MessageFlashList messages={messages} onTopVisibleDate={setTopDate} loadOlder={loadOlder} isLoadingOlder={isLoadingOlder} contentBottomInset={keyboardHeight} />
        <StickyDateHeader title={topDate} />
      </View>

      <TypingIndicator visible={typing} />

      <View style={{ paddingBottom: keyboardHeight }}>
        <Composer
          onSend={(text) => sendMessage({ text, type: 'text' })}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
});

export default ChatScreen;
