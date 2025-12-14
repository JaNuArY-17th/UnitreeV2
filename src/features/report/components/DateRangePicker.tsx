import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Pressable, Modal, Animated } from 'react-native';
import { Text } from '@/shared/components/base';
import { colors, spacing, dimensions, FONT_WEIGHTS, getFontFamily } from '@/shared/themes';
import { Calendar } from '@/shared/assets/icons';
import { useTranslation } from '@/shared/hooks/useTranslation';
import DatePicker from 'react-native-ui-datepicker';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowReloadHorizontalIcon } from '@hugeicons/core-free-icons';

interface DateRange {
  startDate: Date;
  endDate: Date;
  label: string;
}

interface DateRangePickerProps {
  selectedRange?: DateRange;
  onRangeChange?: (range: DateRange) => void;
  onReset?: () => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  selectedRange,
  onRangeChange,
  onReset,
}) => {
  const [activeOption, setActiveOption] = useState<string>('today');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(selectedRange?.startDate);
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(selectedRange?.endDate);
  const { t } = useTranslation('report');
  const { t: commonT, currentLanguage } = useTranslation('common');

  // Animation values
  const scaleValue = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  // Handle modal animation
  useEffect(() => {
    if (showDatePicker) {
      // Reset animation values
      scaleValue.setValue(0);
      backdropOpacity.setValue(0);

      // Show modal immediately
      setIsModalVisible(true);

      // Delay animation to ensure modal is rendered
      requestAnimationFrame(() => {
        // Animate in
        Animated.parallel([
          Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
            damping: 20,
            stiffness: 150,
          }),
          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else if (isModalVisible) {
      // Animate out
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 150,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Hide modal after animation completes
        setIsModalVisible(false);
      });
    }
  }, [showDatePicker, isModalVisible, scaleValue, backdropOpacity]);

  const getQuickOptions = (): DateRange[] => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return [
      {
        startDate: today,
        endDate: today,
        label: t('dateRange.today'),
      },
      {
        startDate: startOfWeek,
        endDate: endOfWeek,
        label: t('dateRange.thisWeek'),
      },
      {
        startDate: startOfMonth,
        endDate: endOfMonth,
        label: t('dateRange.thisMonth'),
      },
    ];
  };

  const quickOptions = getQuickOptions();

  const handleQuickOptionPress = (option: DateRange, optionKey: string) => {
    setActiveOption(optionKey);
    onRangeChange?.(option);
  };

  const handleDatePickerPress = () => {
    setTempStartDate(selectedRange?.startDate);
    setTempEndDate(selectedRange?.endDate);
    setShowDatePicker(true);
  };

  const handleDateChange = (params: any) => {
    if (params.startDate) {
      setTempStartDate(new Date(params.startDate));
    }
    if (params.endDate) {
      setTempEndDate(new Date(params.endDate));
    }
  };

  const handleConfirmDateRange = () => {
    if (tempStartDate && tempEndDate) {
      const newRange: DateRange = {
        startDate: tempStartDate,
        endDate: tempEndDate,
        label: formatDateRange({ startDate: tempStartDate, endDate: tempEndDate, label: '' }),
      };
      onRangeChange?.(newRange);
      setActiveOption('custom');
    }
    // Trigger close animation
    setShowDatePicker(false);
  };

  const handleCancelDateRange = () => {
    setTempStartDate(selectedRange?.startDate);
    setTempEndDate(selectedRange?.endDate);
    // Trigger close animation
    setShowDatePicker(false);
  };

  // Map app languages to DatePicker locales
  const getDatePickerLocale = (language: string): string => {
    const localeMap: Record<string, string> = {
      'vi': 'vi', // Vietnamese
      'en': 'en', // English
    };
    return localeMap[language] || 'en'; // Default to English
  };

  const formatDateRange = (range?: DateRange): string => {
    if (!range) return t('dateRange.selectDateRange');

    // Use current language for locale-based formatting
    const locale = currentLanguage === 'vi' ? 'vi-VN' : 'en-US';

    const formatDate = (date: Date) => {
      return date.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric'
      });
    };

    if (range.startDate.toDateString() === range.endDate.toDateString()) {
      return formatDate(range.startDate);
    }

    return `${formatDate(range.startDate)} - ${formatDate(range.endDate)}`;
  }; return (
    <View style={styles.container}>
      {/* Date Picker Button */}
      <Pressable
        style={[
          styles.datePickerButton,
          selectedRange && styles.datePickerButtonSelected
        ]}
        onPress={handleDatePickerPress}
      >
        <Calendar width={20} height={20} color={colors.primary} />
        <Text style={styles.datePickerText}>
          {formatDateRange(selectedRange)}
        </Text>
        {/* {selectedRange && (
          <View style={styles.selectedIndicator} />
        )} */}
        <Text style={styles.chevron}>▼</Text>
      </Pressable>

      {/* Reset Button */}
      {onReset && (
        <Pressable
          style={styles.resetButton}
          onPress={onReset}
        >
          <HugeiconsIcon icon={ArrowReloadHorizontalIcon} size={20} color={colors.light} />
          <Text style={styles.resetButtonText}>{t('dateRange.reset')}</Text>
        </Pressable>
      )}

      {/* Date Picker Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={handleCancelDateRange}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          {/* Backdrop with fade animation */}
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropOpacity,
              }
            ]}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={handleCancelDateRange} />
          </Animated.View>

          {/* Modal content with scale animation */}
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ scale: scaleValue }],
              }
            ]}
          >
            {/* Handle dash */}
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('dateRange.selectDateRange')}</Text>
            </View>

            <DatePicker
              mode="range"
              startDate={tempStartDate}
              endDate={tempEndDate}
              onChange={handleDateChange}
              locale={getDatePickerLocale(currentLanguage)}
              timePicker={false}
              styles={{
                day_cell: {
                  marginVertical: 1,
                },
                day_label: {
                  paddingTop: spacing.xs,
                  fontSize: 18,
                  fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
                },
                // Today indicator
                today: {
                  backgroundColor: colors.secondary,
                  borderRadius: dimensions.radius.round,
                  borderWidth: 1,
                  borderColor: colors.primary,
                  zIndex: 999,
                },
                today_label: {
                  color: colors.primary,

                  zIndex: 2,
                },
                // Selected date indicators - always visible and on top
                selected: {
                  backgroundColor: colors.primaryLight,
                  borderRadius: dimensions.radius.round,
                },
                selected_label: {
                  color: colors.primary,

                },
                // Range styling - lower z-index so selected appears on top
                range_start: {
                  backgroundColor: colors.primaryLight,
                  borderTopLeftRadius: dimensions.radius.round,
                  borderBottomLeftRadius: dimensions.radius.round,
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                },
                range_start_label: {
                  color: colors.primary,

                },
                range_end: {
                  backgroundColor: colors.primaryLight,
                  borderTopRightRadius: dimensions.radius.round,
                  borderBottomRightRadius: dimensions.radius.round,
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                },
                range_end_label: {
                  color: colors.primary,

                  zIndex: 3,
                },
                range_middle: {
                  backgroundColor: colors.primaryLight,
                  borderRadius: 0,
                  zIndex: 1,
                },
                range_middle_label: {
                  color: colors.primary,
                  fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
                  zIndex: 2,
                },
                // Range fill background
                range_fill: {
                  backgroundColor: colors.light,
                },
              }}
            />

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={handleCancelDateRange}>
                <Text style={styles.cancelButtonText}>{commonT('common.cancel')}</Text>
              </Pressable>
              <Pressable style={styles.confirmButton} onPress={handleConfirmDateRange}>
                <Text style={styles.confirmButtonText}>{commonT('common.confirm')}</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // marginBottom: spacing.lg,
    alignItems: 'center',
    width: '100%',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: dimensions.radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flex: 1,
    // marginBottom: spacing.md,
    // width: '45%',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.light,
    borderRadius: dimensions.radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  resetButtonText: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.light,
    marginLeft: spacing.xs,
  },
  datePickerButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.light,
  },
  datePickerText: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 14,

    color: colors.text.primary,
    lineHeight: 20,
  },
  chevron: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: spacing.xs,
  },
  quickOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  quickOption: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: dimensions.radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
  },
  quickOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  quickOptionText: {
    fontSize: 14,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
    textAlign: 'center',
  },
  quickOptionTextActive: {
    color: colors.light,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    backgroundColor: colors.light,
    borderRadius: dimensions.radius.lg,
    padding: spacing.lg,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  handleContainer: {
    alignItems: 'center',
    paddingBottom: spacing.sm,
  },
  handle: {
    width: 50,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
  },
  modalHeader: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,

    color: colors.text.primary,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.lightGray,
    borderRadius: dimensions.radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.text.secondary,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: dimensions.radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: getFontFamily(FONT_WEIGHTS.REGULAR),
    color: colors.light,
  },
});
