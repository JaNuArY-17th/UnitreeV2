import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Dimensions } from 'react-native';
import { colors, spacing, FONT_WEIGHTS, typography } from '@/shared/themes';
import { subscribeToColorChanges } from '@/shared/themes/colors';
import { Body } from '@/shared/components/base';
import { formatVND } from '@/shared/utils/format';
import { getFontFamily } from '@shared/themes/fonts';

type Props = {
  presetAmounts: number[];
  onAmountSelect: (value: number) => void;
  currentAmount?: number; // Current amount entered by user
};

const PresetAmounts: React.FC<Props> = ({ presetAmounts, onAmountSelect, currentAmount }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const screenWidth = Dimensions.get('window').width;
  const [primaryColor, setPrimaryColor] = useState(colors.primary);

  // Subscribe to color changes
  useEffect(() => {
    const unsubscribe = subscribeToColorChanges((newColors) => {
      setPrimaryColor(newColors.primary);
    });
    return unsubscribe;
  }, []);

  // Auto-scroll to center the selected chip
  useEffect(() => {
    if (currentAmount && scrollViewRef.current) {
      const selectedIndex = presetAmounts.findIndex(amount => amount === currentAmount);

      if (selectedIndex !== -1) {
        // Calculate chip dimensions based on styles and content
        const chipPadding = 14 * 2; // paddingHorizontal: 14 * 2
        const chipGap = spacing.sm;

        // Estimate text width based on formatted VND string length
        const formattedText = formatVND(presetAmounts[selectedIndex]);
        const estimatedTextWidth = formattedText.length * 8; // Rough estimation: 8px per character
        const chipWidth = chipPadding + estimatedTextWidth;

        // Calculate the total width of all chips before the selected one
        let totalWidthBefore = 0;
        for (let i = 0; i < selectedIndex; i++) {
          const text = formatVND(presetAmounts[i]);
          const textWidth = text.length * 8;
          totalWidthBefore += chipPadding + textWidth + chipGap;
        }

        // Add the container's left padding
        const containerPadding = spacing.xl;

        // Calculate scroll position to center the selected chip
        const chipCenterX = totalWidthBefore + (chipWidth / 2);
        const scrollToX = Math.max(0, chipCenterX - (screenWidth / 2) + containerPadding);

        // Add a small delay to ensure smooth animation
        setTimeout(() => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({
              x: scrollToX,
              animated: true,
            });
          }
        }, 150);
      }
    }
  }, [currentAmount, presetAmounts, screenWidth]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {presetAmounts.map((v) => {
          const isSelected = currentAmount === v;
          return (
            <Pressable
              key={v}
              onPress={() => onAmountSelect(v)}
              style={[
                styles.chip,
                isSelected && [styles.selectedChip, { backgroundColor: primaryColor, borderColor: primaryColor }]
              ]}
              accessibilityRole="button"
            >
              <Body style={[
                [styles.chipText, { color: primaryColor }],
                isSelected && styles.selectedChipText
              ]}>
                {formatVND(v)}
              </Body>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // marginTop: spacing.lg,
    // paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.xl,
  },
  chip: {
    borderRadius: spacing.md,
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  chipText: {
    ...typography.subtitle,
    textAlign: 'center'
  },
  selectedChip: {
    // backgroundColor and borderColor will be set dynamically
  },
  selectedChipText: {
    color: colors.light,
  },
});

export default PresetAmounts;
