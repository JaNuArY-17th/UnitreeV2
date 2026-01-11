import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Message } from '../types';
import MessageItem from './MessageItem';

type Props = {
  messages: Message[];
  onTopVisibleDate?: (dateStr?: string) => void;
  loadOlder?: () => void;
  isLoadingOlder?: boolean;
  contentBottomInset?: number;
};

export const MessageFlashList: React.FC<Props> = ({ messages = [], onTopVisibleDate, loadOlder, isLoadingOlder, contentBottomInset = 0 }) => {
  // On inverted lists, viewableItems array is ordered newest-first; pick the last visible item as top
  const viewabilityConfig = React.useRef({ itemVisiblePercentThreshold: 10 });

  const onViewableItemsChanged = React.useRef(({ viewableItems }: any) => {
    if (!viewableItems || viewableItems.length === 0) return;
    // find the item closest to the top of the screen; on inverted, use last
    const topItem = viewableItems[viewableItems.length - 1]?.item as Message | undefined;
    if (topItem && onTopVisibleDate) {
      const dateStr = new Date(topItem.createdAt).toDateString();
      onTopVisibleDate(dateStr);
    }
  }).current;

  const ListFooter = React.useCallback(() => {
    if (!isLoadingOlder) return null;
    return (
      <View style={{ paddingVertical: 12 }}>
        <ActivityIndicator size="small" />
      </View>
    );
  }, [isLoadingOlder]);

  return (
    <View style={{ flex: 1 }}>
      <FlashList
        data={messages}
        // inverted
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageItem message={item} />}
        estimatedItemSize={80}
        maxToRenderPerBatch={10}
        initialNumToRender={20}
        windowSize={5}
        removeClippedSubviews={true}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig.current}
        onEndReached={loadOlder}
        onEndReachedThreshold={0.1}
        maintainVisibleContentPosition={{ minIndexForVisible: 1 } as any}
        ListFooterComponent={ListFooter}
        contentContainerStyle={{ paddingBottom: contentBottomInset }}
      />
    </View>
  );
};

export default MessageFlashList;
