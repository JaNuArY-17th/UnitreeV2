import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from '@/shared/components/base/Text';
import { MenuItem } from './MenuItem';
import { colors, spacing } from '@/shared/themes';
import typographyStyles from '@/shared/themes/typography';

interface MenuItemData {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onPress: () => void;
  showArrow?: boolean;
  // Toggle functionality
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  showToggle?: boolean;
  disabled?: boolean;
  // Custom right component
  rightComponent?: React.ReactNode;
  reverse?: boolean;
}

interface MenuSectionProps {
  title?: string;
  items: MenuItemData[];
  showViewMore?: boolean;
  onViewMore?: () => void;
  viewMoreText?: string;
  reverse?: boolean;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  title,
  items,
  showViewMore = false,
  onViewMore,
  viewMoreText = 'View More',
  reverse = false
}) => {
  return (
    <View style={styles.container}>
      {title && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {showViewMore && onViewMore && (
            <Text style={styles.viewMore} onPress={onViewMore}>
              {viewMoreText}
            </Text>
          )}
        </View>
      )}

      <View style={styles.itemsContainer}>
        {items.map((item, index) => (
          <MenuItem
            key={item.id}
            title={item.title}
            subtitle={item.subtitle}
            icon={item.icon}
            onPress={item.onPress}
            showArrow={item.showArrow}
            isLast={index === items.length - 1}
            toggleValue={item.toggleValue}
            onToggle={item.onToggle}
            showToggle={item.showToggle}
            disabled={item.disabled}
            rightComponent={item.rightComponent}
            reverse={reverse}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    // marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: spacing.md,
  },
  title: {
    paddingVertical: spacing.sm,
    ...typographyStyles.h2,
  },
  viewMore: {
    ...typographyStyles.subtitle,
    color: colors.primary,
  },
  itemsContainer: {
    backgroundColor: colors.light,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: colors.border,
    overflow: 'hidden',
  },
});
