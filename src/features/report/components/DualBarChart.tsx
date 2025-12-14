import React from 'react';
import { View, StyleSheet, Dimensions, Pressable } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Text } from '@/shared/components/base';
import { colors, FONT_WEIGHTS, getFontFamily, spacing, typography } from '@/shared/themes';
import { useTranslation } from '@/shared/hooks/useTranslation';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - (spacing.lg * 2);

interface DualBarData {
  label: string;
  income: number;
  expense: number;
}

interface DualBarChartProps {
  data: DualBarData[];
  selectedPeriod?: string;
  onPeriodChange?: (period: string) => void;
}

export const DualBarChart: React.FC<DualBarChartProps> = ({
  data,
  selectedPeriod = 'Month',
  onPeriodChange,
}) => {
  const { t } = useTranslation('report');
  // Prepare data for react-native-chart-kit
  // Since BarChart doesn't support dual bars, we'll create combined data
  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        data: data.map(item => item.income),
        color: (opacity = 1) => colors.success, // Income color
        strokeWidth: 2,
      },
      {
        data: data.map(item => item.expense),
        color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`, // Expense color
        strokeWidth: 2,
      }
    ],
  };

  const baseChartConfig = {
    backgroundColor: colors.light,
    backgroundGradientFrom: colors.light,
    backgroundGradientTo: colors.light,
    decimalPlaces: 0,
    labelColor: (opacity = 1) => colors.text.secondary,
    style: {
      borderRadius: 0,
    },
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: colors.border,
      strokeOpacity: 0.2,
    },
    propsForLabels: {
      fontSize: 12,
    },
    barPercentage: 0.7,
    fillShadowGradientOpacity: 0,
    useShadowColorFromDataset: false,
    barRadius: 8, // Rounded bars only
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('chart.overview')}</Text>
        {/* <Pressable
          style={styles.periodSelector}
          onPress={() => onPeriodChange?.('Month')}
        >
          <Text style={styles.periodText}>{selectedPeriod}</Text>
          <Text style={styles.chevron}>▼</Text>
        </Pressable> */}
      </View>

      {/* Income Chart */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>{t('statistics.income')}</Text>
        <BarChart
          data={{
            labels: data.map(item => item.label),
            datasets: [{
              data: data.map(item => item.income),
            }]
          }}
          width={chartWidth}
          height={180}
          yAxisLabel=""
          yAxisSuffix="k"
          chartConfig={{
            ...baseChartConfig,
            color: (opacity = 1) => colors.success,
          }}
          verticalLabelRotation={0}
          withInnerLines={true}
          showBarTops={false}
          fromZero={true}
          style={styles.chart}
        />
      </View>

      {/* Expense Chart */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>{t('statistics.expense')}</Text>
        <BarChart
          data={{
            labels: data.map(item => item.label),
            datasets: [{
              data: data.map(item => item.expense),
            }]
          }}
          width={chartWidth}
          height={180}
          yAxisLabel=""
          yAxisSuffix="k"
          chartConfig={{
            ...baseChartConfig,
            color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`, // Amber orange bars
          }}
          verticalLabelRotation={0}
          withInnerLines={true}
          showBarTops={false}
          fromZero={true}
          style={styles.chart}
        />
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>{t('statistics.income')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendText}>{t('statistics.expense')}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg * 6,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.text.primary,
  },
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodText: {
    ...typography.body,
    color: colors.text.primary,
    marginRight: spacing.xs,
  },
  chevron: {
    ...typography.caption,
    fontSize: 10,
    color: colors.text.secondary,
  },
  chartSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.subtitle,

    color: colors.text.primary,
    marginBottom: spacing.sm,
    paddingLeft: spacing.sm,
  },
  chart: {
    borderRadius: 0,
    marginVertical: 0,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.xs,
  },
  legendText: {
    ...typography.body,
    color: colors.text.secondary,
  },
});
