import React from 'react';
import { View, StyleSheet, Pressable, Dimensions, Modal, Platform } from 'react-native';
import { colors, spacing } from '@/shared/themes';
import Text from './Text';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Cancel01Icon } from '@hugeicons/core-free-icons';

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeightRatio?: number; // 0..1
  showHandle?: boolean;
  headerContent?: React.ReactNode; // replaces title when provided
  footerContent?: React.ReactNode;
  testID?: string;
  fillToMaxHeight?: boolean;
};

/**
 * Bottom sheet component using @gorhom/bottom-sheet with API compatibility
 * for the existing custom BottomSheet implementation.
 */
const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  children,
  maxHeightRatio = 0.95,
  showHandle = true,
  headerContent,
  footerContent,
  testID,
  fillToMaxHeight,
}) => {
  const { height: screenHeight } = Dimensions.get('window');
  const maxHeight = Math.round(screenHeight * maxHeightRatio);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={[styles.container, { maxHeight }]} testID={testID}>
          {/* Header */}
          {headerContent ? (
            <View style={styles.header}>{headerContent}</View>
          ) : title ? (
            <View style={styles.headerRow}>
              <View style={styles.headerSide} />
              <Text variant="subtitle" style={styles.title}>{title}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={onClose}
                hitSlop={8}
                style={styles.headerSide}
              >
                <HugeiconsIcon icon={Cancel01Icon} size={20} color={colors.text.primary} />
              </Pressable>
            </View>
          ) : null}

          {/* Content */}
          <View style={styles.content}>
            {children}
          </View>

          {/* Footer */}
          {footerContent ? <View style={styles.footer}>{footerContent}</View> : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  container: {
    backgroundColor: colors.light,
    borderTopLeftRadius: spacing.xl,
    borderTopRightRadius: spacing.xl,
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerSide: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  content: {
    paddingHorizontal: spacing.lg,
    flex: 1,
    minHeight: 0,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
});

export default BottomSheet;
