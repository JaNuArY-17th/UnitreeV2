import React, { useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet, Pressable, Dimensions, FlatList, FlatListProps, Platform } from 'react-native';
import { colors, FONT_WEIGHTS, getFontFamily, spacing } from '@/shared/themes';
import Text from './Text';
import BottomSheetModal from './BottomSheetModal';

export interface BottomSheetFlatListModalProps<T> extends Omit<FlatListProps<T>, 'data' | 'renderItem' | 'keyExtractor'> {
  // Modal props
  visible: boolean;
  onClose: () => void;
  title?: string;
  headerContent?: React.ReactNode; // replaces title when provided
  footerContent?: React.ReactNode;
  testID?: string;

  // Sheet configuration
  maxHeightRatio?: number; // 0..1
  showHandle?: boolean;
  fillToMaxHeight?: boolean;
  enableDynamicSizing?: boolean; // Allow content to determine height
  snapPoints?: (string | number)[]; // Custom snap points

  // FlatList props
  data: readonly T[] | null | undefined;
  renderItem: FlatListProps<T>['renderItem'];
  keyExtractor: (item: T, index: number) => string;

  // Optional FlatList props that are commonly used
  ListHeaderComponent?: FlatListProps<T>['ListHeaderComponent'];
  ListFooterComponent?: FlatListProps<T>['ListFooterComponent'];
  ListEmptyComponent?: FlatListProps<T>['ListEmptyComponent'];
  ItemSeparatorComponent?: FlatListProps<T>['ItemSeparatorComponent'];
  showsVerticalScrollIndicator?: boolean;
  contentContainerStyle?: FlatListProps<T>['contentContainerStyle'];

  // Focus hook for navigation integration
  focusHook?: any; // BottomSheet specific prop
}

/**
 * Reusable BottomSheetFlatList component that combines BottomSheetModal with BottomSheetFlatList
 * from @gorhom/bottom-sheet for optimized scrolling performance in bottom sheets.
 *
 * This component provides better scrolling performance compared to regular FlatList
 * inside bottom sheets and handles gesture conflicts automatically.
 *
 * Features sticky header behavior where:
 * - headerContent/title remains fixed at the top
 * - ListHeaderComponent also remains fixed below the headerContent
 * - Only the main list items (data) scroll underneath these fixed headers
 */
function BottomSheetFlatListModal<T>({
  // Modal props
  visible,
  onClose,
  title,
  headerContent,
  footerContent,
  testID,

  // Sheet configuration
  maxHeightRatio = 1,
  showHandle = true,
  fillToMaxHeight = false,
  enableDynamicSizing = false,
  snapPoints: customSnapPoints,

  // FlatList props
  data,
  renderItem,
  keyExtractor,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  ItemSeparatorComponent,
  showsVerticalScrollIndicator = false,
  contentContainerStyle,
  focusHook,

  // Other FlatList props
  ...flatListProps
}: BottomSheetFlatListModalProps<T>) {
  const { height: screenHeight } = Dimensions.get('window');

  // Calculate snap points based on configuration
  const snapPoints = useMemo(() => {
    // Use custom snap points if provided
    if (customSnapPoints) {
      return customSnapPoints;
    }

    // Calculate max height percentage based on maxHeightRatio
    const maxHeightPercentage = `${Math.round(maxHeightRatio * 100)}%`;

    // If dynamic sizing is enabled, use percentage-based snap points
    if (enableDynamicSizing) {
      if (fillToMaxHeight) {
        return [maxHeightPercentage]; // Single snap point respecting maxHeightRatio
      }
      // Two snap points with dynamic sizing, respecting maxHeightRatio
      const halfHeightPercentage = `${Math.round(maxHeightRatio * 50)}%`;
      return [halfHeightPercentage, maxHeightPercentage];
    }

    // Traditional fixed height approach
    const maxHeight = screenHeight * maxHeightRatio;
    if (fillToMaxHeight) {
      return [maxHeight];
    }
    return [maxHeight * 0.5, maxHeight];
  }, [customSnapPoints, enableDynamicSizing, fillToMaxHeight, maxHeightRatio, screenHeight]);

  // No present/dismiss; Modal handles visibility. Closing handled by onClose.

  // Render header component
  const renderHeader = useCallback(() => {
    if (headerContent) {
      return headerContent;
    }

    if (title) {
      return (
        <View style={styles.headerRow}>
          <View style={styles.headerSide} />
          <Text variant="title" style={styles.title}>{title}</Text>
          <View style={styles.headerSide} />
        </View>
      );
    }

    return null;
  }, [headerContent, title]);

  // Render sticky ListHeaderComponent (separate from fixed header)
  const stickyListHeader = useMemo(() => {
    if (!ListHeaderComponent) {
      return undefined;
    }

    return () => (
      <View style={styles.stickyListHeader}>
        {typeof ListHeaderComponent === 'function'
          ? <ListHeaderComponent />
          : ListHeaderComponent
        }
      </View>
    );
  }, [ListHeaderComponent]);

  // No need to combine footer since BottomSheetModal handles footerContent separately
  // ListFooterComponent will be used directly in FlatList

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      maxHeightRatio={maxHeightRatio}
      showHandle={showHandle}
      fillToMaxHeight={fillToMaxHeight}
      enableDynamicSizing={enableDynamicSizing}
      snapPoints={customSnapPoints}
      testID={testID}
      headerContent={renderHeader()}
      footerContent={footerContent}
    >
      <View style={styles.sheetContent}>
        {/* Fixed ListHeaderComponent */}
        {stickyListHeader && (
          <View style={styles.fixedListHeader}>
            {stickyListHeader()}
          </View>
        )}

        {/* Scrollable FlatList with data items only */}
        <View style={styles.listContainer}>
          <FlatList
            testID={testID}
            data={data}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ListHeaderComponent={undefined} // Remove header from FlatList since it's now fixed
            ListFooterComponent={ListFooterComponent}
            ListEmptyComponent={ListEmptyComponent}
            ItemSeparatorComponent={ItemSeparatorComponent}
            showsVerticalScrollIndicator={showsVerticalScrollIndicator}
            contentContainerStyle={[styles.listContent, contentContainerStyle]}
            {...(flatListProps as any)}
          />
        </View>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetContent: {
    maxHeight: '100%',
  },
  listContainer: {
    maxHeight: '100%',
  },
  fixedListHeader: {
    backgroundColor: colors.light,
    zIndex: 15,
    // elevation: 15, // For Android
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.light,
  },
  headerSide: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',

    fontSize: 20,
    // paddingHorizontal: spacing.lg,
  },
  stickyListHeader: {
    backgroundColor: colors.light,
    zIndex: 10,
    // elevation: 10,
  },
  listContent: {
    // paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.md,
  },
});

export default BottomSheetFlatListModal;
