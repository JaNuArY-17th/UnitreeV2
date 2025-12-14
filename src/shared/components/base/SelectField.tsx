import { useMemo, useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, ViewStyle, TouchableOpacity, Keyboard } from 'react-native';
import { colors, spacing } from '@/shared/themes';
import Text from './Text';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowRight01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import BottomSheetFlatList from './BottomSheetFlatList';
import SearchBar from '@shared/components/SearchBar';

export interface SelectOption<T = string> { label: string; value: T; extra?: any }

export interface SelectFieldProps<T = string> {
  label?: string;
  placeholder?: string;
  value?: T;
  options: SelectOption<T>[];
  onChange: (val: T) => void;
  renderValue?: (val?: T) => string | undefined;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyLabel?: string;
  error?: string;
  onBlur?: () => void;
  style?: ViewStyle; // optional container style override (back-compat)
  containerStyle?: ViewStyle; // preferred container style override
}

function SelectField<T = string>({ label, placeholder = 'Select', value, options, onChange, renderValue, disabled, searchable = true, searchPlaceholder = 'Search', emptyLabel = 'No results', error, onBlur, style, containerStyle }: SelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const display = renderValue ? renderValue(value) : options.find(o => o.value === value)?.label;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 2000); // 300ms delay

    return () => clearTimeout(timer);
  }, [query]);

  const filtered = useMemo(() => {
    if (!searchable || !debouncedQuery.trim()) return options;
    const q = debouncedQuery.trim().toLowerCase();
    return options.filter(o => `${o.label}`.toLowerCase().includes(q));
  }, [options, debouncedQuery, searchable]);

  // Handle option selection
  const handleOptionSelect = (option: SelectOption<T>) => {
    onChange(option.value);
    handleClose();
  };

  // Handle bottom sheet close - reset search query
  const handleClose = () => {
    setQuery('');
    setOpen(false);
    onBlur?.();
  };

  // Render option item
  const renderOptionItem = ({ item }: { item: SelectOption<T> }) => {
    const selected = item.value === value;
    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={selected ? { selected: true } : undefined}
        onPress={() => handleOptionSelect(item)}
        style={styles.listItem}
      >
        <Text variant="body" style={{ flex: 1 }}>{item.label}</Text>
        {selected && (
          <HugeiconsIcon icon={Tick02Icon} size={20} color={colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  // Empty state component
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text variant="body" style={styles.emptyText}>{emptyLabel}</Text>
    </View>
  );
  return (
    <View style={[styles.container, containerStyle || style]}>
      {label && <Text variant="subtitle" style={styles.label}>{label}</Text>}
      <TouchableOpacity
        disabled={disabled}
        onPress={() => {
          // Dismiss keyboard first, then open immediately
          Keyboard.dismiss();
          setOpen(true);
        }}
        style={[styles.field, error && styles.errorField]}
      >
        <Text variant="body" style={[styles.value, !display && styles.placeholder]} numberOfLines={1}>
          {display || placeholder}
        </Text>
        {/* ChevronDown (rotate right chevron) per Figma 20x20 stroke #9CA3AF */}
        <View style={[styles.chevronBox, { transform: [{ rotate: open ? '-90deg' : '90deg' }] }]}>
          <HugeiconsIcon icon={ArrowRight01Icon} size={20} color={colors.text.secondary} />
        </View>
      </TouchableOpacity>

      {error ? (
        <Text variant="caption" style={styles.errorText}>{error}</Text>
      ) : null}

      {/* BottomSheetFlatList Dropdown */}
      <BottomSheetFlatList
        visible={open}
        onClose={handleClose}
        title={label || placeholder}
        testID="select-field-sheet"
        data={filtered}
        maxHeightRatio={0.8}
        fillToMaxHeight={true}
        keyExtractor={(item, index) => `${String((item as SelectOption<T>).value ?? index)}-${index}`}
        renderItem={renderOptionItem}
        ListHeaderComponent={
          searchable ? (
            <View style={styles.searchContainer}>
              <SearchBar
                value={query}
                onChangeText={setQuery}
                placeholder={searchPlaceholder}
              />
            </View>
          ) : null
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={12}
        maxToRenderPerBatch={24}
        windowSize={7}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  label: { marginBottom: spacing.xs, color: colors.text.primary },
  field: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.light,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorField: {
    borderColor: colors.danger,
  },
  errorText: {
    marginTop: spacing.xs,
    color: colors.danger,
  },
  value: { color: colors.text.primary, flex: 1, marginRight: spacing.sm, flexShrink: 1, minWidth: 0, fontSize: 16 },
  placeholder: { color: colors.text.secondary },
  chevronBox: {
    width: 20,
    height: 20,
    marginLeft: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    textAlign: 'center',
  },
  sep: { height: 1, backgroundColor: colors.mutedLine },
  listItem: {
    paddingVertical: spacing.md,
    // paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  }
});

export default SelectField;
