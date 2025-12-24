import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { Text } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/themes';
import { ChevronRight } from '@shared/assets/icons';

export interface DiscoverCardConfig {
  id: string;
  type: 'promo' | 'news';
  title: string;
  subtitle?: string;
  badge: string;
  actionLabel: string;
  accentColor: 'green' | 'blue';
  onPress: () => void;
}

interface DiscoverCardsProps {
  title?: string;
  onViewAll?: () => void;
  cards: DiscoverCardConfig[];
}

const getAccentColor = (color: 'green' | 'blue'): string => {
  return color === 'green' ? colors.primary : colors.secondary;
};

const DiscoverCard: React.FC<{
  card: DiscoverCardConfig;
  isDark: boolean;
}> = ({ card, isDark }) => {
  const accentColor = getAccentColor(card.accentColor);
  const backgroundColor = card.accentColor === 'green'
    ? colors.primary
    : colors.secondary;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: isDark
            ? `${backgroundColor}20`
            : `${backgroundColor}15`,
        },
      ]}
      onPress={card.onPress}
      activeOpacity={0.7}
    >
      {/* Decorative blur */}
      <View
        style={[
          styles.blurDecor,
          {
            backgroundColor: backgroundColor,
            opacity: 0.1,
          },
        ]}
      />

      <View style={styles.cardContent}>
        {/* Badge */}
        <View
          style={[
            styles.badge,
            {
              backgroundColor: isDark
                ? `rgba(0,0,0,0.2)`
                : `rgba(255,255,255,0.6)`,
            },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              {
                color:
                  card.accentColor === 'green'
                    ? '#4CAF50'
                    : '#2196F3',
              },
            ]}
          >
            {card.badge}
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.cardTitle}>{card.title}</Text>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <Text style={styles.actionLabel}>{card.actionLabel}</Text>
          <View
            style={[
              styles.arrowButton,
              {
                backgroundColor: isDark
                  ? `rgba(0,0,0,0.2)`
                  : `rgba(255,255,255,1)`,
              },
            ]}
          >
            <ChevronRight width={16} height={16} color={colors.dark} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const DiscoverCards: React.FC<DiscoverCardsProps> = ({
  title = 'Discover',
  onViewAll,
  cards,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{title}</Text>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Cards Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        style={styles.cardsScroll}
        contentContainerStyle={styles.cardsContent}
        snapToInterval={288 + spacing.md} // Card width + gap
        decelerationRate="fast"
      >
        {cards.map((card) => (
          <DiscoverCard
            key={card.id}
            card={card}
            isDark={isDark}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const CARD_WIDTH = 288;

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl * 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  headerTitle: {
    ...typography.h2,
    fontWeight: '700',
    color: colors.dark,
  },
  viewAllText: {
    ...typography.caption,
    fontWeight: '500',
    color: colors.gray,
  },
  cardsScroll: {
    marginHorizontal: -spacing.md,
  },
  cardsContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 24,
    padding: spacing.md,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'space-between',
    minHeight: 180,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  blurDecor: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    right: -32,
    bottom: -32,
  },
  cardContent: {
    gap: spacing.md,
    zIndex: 10,
    justifyContent: 'space-between',
    flex: 1,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  cardTitle: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.dark,
    lineHeight: 24,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionLabel: {
    ...typography.caption,
    fontWeight: '500',
    color: colors.gray,
  },
  arrowButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
