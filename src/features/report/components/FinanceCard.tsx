import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from '@/shared/components/base/Text';
import { colors, FONT_WEIGHTS, getFontFamily, spacing, typography } from '@/shared/themes';
import { ArrowCircleUp, ArrowCircleDown } from '@/shared/assets/icons';
import { FinanceCardPattern } from './FinanceCardPattern';
import { useTranslation } from '@/shared/hooks/useTranslation';

type FinanceType = 'income' | 'expense';

interface FinanceCardProps {
  type: FinanceType;
  label: string;
  amount: string;
  backgroundColor: string;
  patternColor: string;
}

export const FinanceCard: React.FC<FinanceCardProps> = ({
  type,
  label,
  amount,
  backgroundColor,
  patternColor,
}) => {
  const getIcon = () => {
    if (type === 'income') {
      return <ArrowCircleDown width={40} height={40} color={colors.light} />;
    }
    return <ArrowCircleUp width={40} height={40} color={colors.light} />;
  };

  return (
    <View style={styles.card}>
      <FinanceCardPattern
        backgroundColor={backgroundColor}
        patternColor={patternColor}
        borderRadius={16}
        patternOpacity={0.8}
        type={type}
      />
      <View style={styles.cardContent}>
        <View style={styles.cardIcon}>
          {getIcon()}
        </View>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={styles.cardAmount}>${amount}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  cardContent: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    // backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  cardLabel: {
    ...typography.subtitle,
    color: colors.light,
  },
  cardAmount: {
    ...typography.h1,
    fontSize: 24,
    color: colors.light,
    paddingTop: spacing.sm,
  },
});
