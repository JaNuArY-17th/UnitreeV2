import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TicketCard from '@/shared/components/base/TicketCard';
import { colors, FONT_WEIGHTS, getFontFamily, spacing } from '@/shared/themes';

interface CouponCardProps {
  code: string;
  validTill: string;
  applicableOn: string;
  amount: string;
  currency?: string;
}

const CouponCard: React.FC<CouponCardProps> = ({
  code,
  validTill,
  applicableOn,
  amount,
  currency = 'đ',
}) => {
  return (
    <TicketCard
      style={styles.ticketContainer}
      showPerforationLine={true}
      perforationPosition="middle"
      perforationColor={colors.lightGray}
    >
      {/* Top Section */}
      <View style={styles.topSection}>
        <View style={styles.leftContent}>
          <Text style={styles.codeText}>{code}</Text>
        </View>
        <View style={styles.rightContent}>
          <Text style={styles.labelText}>Valid Till</Text>
          <Text style={styles.dateText}>{validTill}</Text>
        </View>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <View style={styles.leftContent}>
          <Text style={styles.labelText}>APPLICABLE ON</Text>
          <Text style={styles.applicableText}>{applicableOn}</Text>
        </View>
        <View style={styles.rightContent}>
          <Text style={styles.amountText}>{currency}: {amount}</Text>
        </View>
      </View>
    </TicketCard>
  );
};

const styles = StyleSheet.create({
  ticketContainer: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: spacing.lg,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: spacing.lg,
  },
  leftContent: {
    flex: 1,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  codeText: {
    fontSize: 18,

    color: colors.text.primary,
  },
  labelText: {
    fontSize: 12,
    color: colors.text.secondary,
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 14,
    color: colors.text.primary,
    marginTop: 2,
  },
  applicableText: {
    fontSize: 14,
    color: colors.text.primary,
    marginTop: 2,
  },
  amountText: {
    fontSize: 18,

    color: colors.success,
  },
});

export default CouponCard;
