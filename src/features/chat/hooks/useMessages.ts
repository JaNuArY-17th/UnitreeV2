import React, { useCallback, useState } from 'react';
import { Message } from '../types';
// Ensure secure/random polyfill is loaded before `uuid` calls in this module
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);

  const sendMessage = useCallback((payload: { text?: string; type?: string }) => {
    const m: Message = {
      id: uuidv4(),
      text: payload.text,
      type: (payload.type as any) || 'text',
      senderId: 'me',
      senderName: 'Bạn',
      createdAt: Date.now(),
      mine: true,
    };
    setMessages((prev) => [m, ...prev]);
    // sending hides typing
    setTyping(false);
  }, []);

  const generateMock = useCallback((count = 200) => {
    const sample = [] as Message[];
    for (let i = 0; i < count; i++) {
      sample.push({
        id: uuidv4(),
        text: `Sample message ${i + 1}`,
        senderId: i % 3 === 0 ? 'me' : `user${i % 5}`,
        senderName: i % 3 === 0 ? 'Bạn' : `Người ${i % 5}`,
        createdAt: Date.now() - i * 60000,
        type: 'text',
        mine: i % 3 === 0,
      });
    }

    // messages are shown in inverted FlashList; newest should appear at bottom => store newest first in array
    setMessages(sample.reverse());
  }, []);

  const loadOlder = useCallback(async (count = 50) => {
    if (isLoadingOlder) return;
    setIsLoadingOlder(true);
    // simulate fetch delay
    await new Promise((res) => setTimeout(res, 250));

    const older: Message[] = [];
    const now = Date.now();
    for (let i = 0; i < count; i++) {
      const idx = messages.length + i + 1;
      older.push({
        id: uuidv4(),
        text: `Older message ${idx}`,
        senderId: idx % 3 === 0 ? 'me' : `user${idx % 5}`,
        senderName: idx % 3 === 0 ? 'Bạn' : `Người ${idx % 5}`,
        createdAt: now - (messages.length + i + 1) * 60000,
        type: 'text',
        mine: idx % 3 === 0,
      });
    }

    // Prepend older messages to the beginning (they are older so should be at the start of the array)
    setMessages((prev) => [...prev, ...older]);
    setIsLoadingOlder(false);
  }, [isLoadingOlder, messages.length]);

  return {
    messages,
    sendMessage,
    generateMock,
    typing,
    setTyping,
    loadOlder,
    isLoadingOlder,
  };
};

export default useMessages;
