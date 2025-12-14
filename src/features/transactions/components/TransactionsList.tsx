import React from 'react';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import Text from '@/shared/components/base/Text';
import { colors, dimensions, FONT_WEIGHTS, getFontFamily, spacing, typography } from '@/shared/themes';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowUpRight01Icon, ArrowDownLeft01Icon } from '@hugeicons/core-free-icons';
import { Transaction } from '../mock/transactionsMockData';
import { useTranslation } from 'react-i18next';

interface TransactionsListProps {
  transactions: Transaction[];
}

const TransactionsList: React.FC<TransactionsListProps> = ({
  transactions,
}) => {
  const { t } = useTranslation('transactions');

  const getDirectionIcon = (isFrom: boolean) => {
    if (isFrom) {
      return <HugeiconsIcon icon={ArrowUpRight01Icon} size={24} color={colors.light} />;
    }
    return <HugeiconsIcon icon={ArrowDownLeft01Icon} size={24} color={colors.light} />;
  };

  const getDirectionBackgroundColor = (isFrom: boolean) => {
    return isFrom ? colors.infoSoft : colors.success;
  };

  const handleTransactionPress = (transaction: Transaction) => {
    // TODO: Navigate to transaction detail screen
    console.log('Transaction pressed:', transaction.id);
  };

  return (
    <View style={styles.container}>
      {transactions.map((transaction, transactionIndex) => {
        // Create 2 items for each transaction: from and to of the same transaction
        const transactionItems = [
          {
            name: transaction.from || t('bank'),
            details: transaction.fromAccount,
            type: t('from'),
            isFrom: true,
            hasAccountDetails: !!(transaction.from && transaction.fromAccount),
          },
          {
            name: transaction.to || t('bank'),
            details: transaction.toAccount,
            type: t('to'),
            isFrom: false,
            hasAccountDetails: !!(transaction.to && transaction.toAccount),
          },
        ];

        return (
          <TouchableOpacity
            key={transaction.id}
            activeOpacity={0.7}
            onPress={() => handleTransactionPress(transaction)}
          >
            {transactionItems.map((item, itemIndex) => (
              <React.Fragment key={`${transaction.id}-${itemIndex}`}>
                <View style={styles.transactionItem}>
                  {/* Status Icon with enhanced background */}
                  <View style={styles.transactionIconContainer}>
                    <View style={[
                      styles.iconCircle,
                      { backgroundColor: getDirectionBackgroundColor(item.isFrom) }
                    ]}>
                      {getDirectionIcon(item.isFrom)}
                    </View>
                    {/* Show connecting line between from and to */}
                    {/* {itemIndex === 0 && (
                      <View style={[
                        styles.connectingLine,
                        { backgroundColor: getStatusColor(transaction.state) }
                      ]} />
                    )} */}
                  </View>

                  {/* Transaction Details */}
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    {item.hasAccountDetails && (
                      <View style={styles.detailsRow}>
                        <Text style={styles.accountLabel}>{item.type}:</Text>
                        <Text style={styles.transactionDetails} numberOfLines={1}>
                          {item.details}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                {/* Show separator between from and to within same transaction */}
                {itemIndex === 0 && (
                  <View style={styles.separator} />
                )}
              </React.Fragment>
            ))}
            {/* Show separator between different transactions, but not after the last one */}
            {transactionIndex < transactions.length - 1 && (
              <View style={[styles.separator, styles.transactionSeparator]} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: dimensions.radius.lg,
    paddingHorizontal: spacing.lg,
    // paddingVertical: spacing.xs,
    marginBottom: spacing.lg,
    backgroundColor: '#FFFFFF',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    // paddingVertical: spacing.md,
    minHeight: 60,
  },
  transactionIconContainer: {
    marginRight: spacing.md,
    alignItems: 'center',
    position: 'relative',
    width: 40,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    // Add subtle shadow to icon background
  },
  connectingLine: {
    position: 'absolute',
    top: 42,
    left: 20,
    width: 2,
    height: 16,
    borderRadius: dimensions.radius.xl * 2,
    opacity: 0.5,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.xl * 2 + spacing.sm, // Align with transaction content
    marginRight: 0,
    opacity: 0.5,
  },
  transactionSeparator: {
    marginLeft: 0,
    marginVertical: spacing.lg,
    backgroundColor: colors.lightGray,
    opacity: 1,
    height: 8,
  },
  transactionInfo: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  transactionName: {
    ...typography.subtitle,
    color: colors.text.primary,
    // marginBottom: spacing.xs,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  accountLabel: {
    ...typography.body,
    color: colors.text.secondary,
    textTransform: 'capitalize',
    letterSpacing: 0.5
  },
  transactionDetails: {
    ...typography.body,
    color: colors.text.secondary,
    flex: 1,
    letterSpacing: 0.5
  },
});

export default TransactionsList;
