import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, FONT_WEIGHTS, getFontFamily, spacing, typography } from '@/shared/themes';
import { Button } from './base';
import { ChartTimeframe, CHART_TIMEFRAMES } from '@/shared/types/timeframe';

interface TimeframeSelectorProps {
  selectedTimeframe: ChartTimeframe;
  onTimeframeChange: (timeframe: ChartTimeframe) => void;
  style?: any;
}

const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
  selectedTimeframe,
  onTimeframeChange,
  style,
}) => {
  const { t } = useTranslation('common');

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CHART_TIMEFRAMES.map((timeframe) => {
          const isSelected = selectedTimeframe === timeframe.value;

          return (
            <Button
              key={timeframe.value}
              label={t(`timeframes.${timeframe.value}`)}
              variant={isSelected ? 'secondary' : 'ghost'}
              size="sm"
              style={[
                styles.timeframeButton,
                isSelected && styles.selectedButton,
              ]}
              textStyle={[
                styles.timeframeText,
                isSelected && styles.selectedText,
              ]}
              onPress={() => onTimeframeChange(timeframe.value)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: spacing.sm,
    // gap: spacing.xs,
  },
  timeframeButton: {
    minWidth: 40,
    height: 32,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedButton: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  timeframeText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  selectedText: {
    color: colors.primary,
    textTransform: 'capitalize',
  },
});

export default TimeframeSelector;
