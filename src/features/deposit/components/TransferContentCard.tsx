import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, dimensions, spacing, typography, getFontFamily, FONT_WEIGHTS } from '@/shared/themes';
import { Body, Text } from '@/shared/components/base';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Note01Icon } from '@hugeicons/core-free-icons';

const TransferContentCard: React.FC<{ transferContent: string }> = ({ transferContent }) => {
  const { t } = useTranslation('deposit');

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <HugeiconsIcon icon={Note01Icon} size={18} color={colors.primary} />
          </View>
          <Text style={styles.title}>{t('transferContent')}</Text>
        </View>
        <View style={styles.contentContainer}>
          <Body style={styles.content}>{transferContent || '---'}</Body>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: spacing.xl,
    marginVertical: spacing.md,
  },
  card: {
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.light,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    ...typography.subtitle,
    color: colors.primary,
    fontFamily: getFontFamily(FONT_WEIGHTS.BOLD),
  },
  contentContainer: {
    backgroundColor: colors.light,
    padding: spacing.md,
    borderRadius: 12,
    marginTop: spacing.xs,
  },
  content: {
    ...typography.body,
    color: colors.text.primary,
    fontFamily: getFontFamily(FONT_WEIGHTS.MEDIUM),
    lineHeight: 22,
  },
});

export default TransferContentCard;
