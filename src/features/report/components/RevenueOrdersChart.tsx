import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { colors, spacing, FONT_WEIGHTS, getFontFamily, typography, dimensions } from '@/shared/themes';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { Text } from '@/shared/components';

interface RevenueOrdersChartProps {
  data: Array<{
    month: string;
    monthLabel: string;
    incomeAmount: number;
    transactionCount: number;
  }>;
}

export const RevenueOrdersChart: React.FC<RevenueOrdersChartProps> = ({ data }) => {
  const { t } = useTranslation('report');

  const monthTranslations = t('chart.months', { returnObjects: true }) as Record<string, string>;

  const getLocalizedMonthLabel = (month: string) => {
    const key = month.toLowerCase();
    return monthTranslations[key] || month;
  };

  const responsiveValues = useMemo(() => {
    const screenWidth = Dimensions.get('window').width;
    const isTablet = screenWidth >= 768; // Tablet breakpoint
    const horizontalPadding = spacing.lg * 2; // Account for screen padding
    const chartPadding = spacing.md * 2; // Account for chart container padding

    // Calculate full-width chart dimensions
    const availableWidth = screenWidth - horizontalPadding - chartPadding - 40; // 40 for y-axis labels
    const dataLength = data.length || 6;
    const calculatedBarWidth = Math.min(Math.floor((availableWidth - (dataLength * 12)) / dataLength), 32);
    const calculatedSpacing = Math.min(Math.floor((availableWidth - (dataLength * calculatedBarWidth)) / (dataLength + 1)), 20);

    return {
      isTablet,
      chartWidth: availableWidth, // Full container width
      chartHeight: isTablet ? 220 : 200,
      containerPadding: isTablet ? spacing.lg : spacing.md,
      sectionMargin: isTablet ? spacing.lg : spacing.xl,
      barWidth: isTablet ? 28 : calculatedBarWidth,
      barSpacing: isTablet ? 20 : calculatedSpacing,
      fontSize: isTablet ? 11 : 10,
      legendSize: isTablet ? 14 : 13,
    };
  }, [data.length]);

  // Transaction chart data
  const transactionChartData = React.useMemo(() => {
    return data.map((item) => ({
      value: item.transactionCount,
      label: item.monthLabel || getLocalizedMonthLabel(item.month),
      frontColor: colors.primary,
    }));
  }, [data, monthTranslations]);

  // Revenue chart data with line data
  const revenueChartData = React.useMemo(() => {
    return data.map((item) => ({
      value: parseFloat((item.incomeAmount / 1000000).toFixed(1)), // Convert to millions
      label: item.monthLabel || getLocalizedMonthLabel(item.month),
      frontColor: colors.success
    }));
  }, [data, monthTranslations]);

  const revenueLineData = React.useMemo(() => {
    return data.map((item) => ({
      value: item.incomeAmount / 1000000,
      dataPointText: '',
    }));
  }, [data]);

  const maxTransactions = Math.max(...data.map(item => item.transactionCount), 1);
  const maxRevenue = Math.max(...data.map(item => item.incomeAmount / 1000000), 1);

  // Format Y-axis labels for revenue chart (show as millions with M suffix)
  const formatRevenueYLabel = (value: string) => {
    const numValue = parseFloat(value);
    if (numValue === 0) return '0';
    if (Number.isInteger(numValue)) {
      return `${numValue}M`;
    }
    return `${numValue.toFixed(1)}M`;
  };

  return (
    <View style={[styles.container]}>
      {responsiveValues.isTablet ? (
        // Horizontal layout for tablets
        <View style={styles.tabletContainer}>
          {/* Transaction Chart */}
          <View style={styles.tabletChartSection}>
            <View style={styles.chartHeader}>
              <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
              <Text style={[styles.chartTitle, { fontSize: responsiveValues.legendSize }]}>
                {t('screen.revenueReport.chart.transactions')}
              </Text>
            </View>
            <BarChart
              data={transactionChartData}
              barWidth={responsiveValues.barWidth}
              spacing={responsiveValues.containerPadding}
              roundedTop
              hideRules={false}
              xAxisThickness={1}
              xAxisColor={colors.border || '#E5E5E5'}
              yAxisThickness={0}
              yAxisTextStyle={{
                ...typography.caption,
                color: colors.text?.secondary || '#666',
                fontSize: responsiveValues.fontSize
              }}
              xAxisLabelTextStyle={{
                ...typography.caption,
                color: colors.text?.secondary || '#666',
                fontSize: responsiveValues.fontSize
              }}
              noOfSections={4}
              maxValue={maxTransactions * 1.15}
              height={responsiveValues.chartHeight}
              width={responsiveValues.chartWidth}
              isAnimated
              animationDuration={1200}
              showValuesAsTopLabel
              barBorderRadius={4}
              topLabelTextStyle={{
                fontSize: 10,
                color: colors.text.primary,
                textAlign: 'center',
              }}
            />
          </View>

          {/* Revenue Chart with Line */}
          <View style={styles.tabletChartSection}>
            <View style={styles.chartHeader}>
              <View style={[styles.legendColor, { backgroundColor: colors.success }]} />
              <Text style={[styles.chartTitle, { fontSize: responsiveValues.legendSize }]}>
                {t('screen.revenueReport.chart.revenue')}
              </Text>
            </View>
            <BarChart
              data={revenueChartData}
              barWidth={responsiveValues.barWidth}
              spacing={responsiveValues.containerPadding}
              roundedTop
              hideRules={false}
              xAxisThickness={1}
              xAxisColor={colors.border || '#E5E5E5'}
              yAxisThickness={0}
              yAxisTextStyle={{
                ...typography.caption,
                color: colors.text?.secondary || '#666',
                fontSize: responsiveValues.fontSize
              }}
              xAxisLabelTextStyle={{
                ...typography.caption,
                color: colors.text?.secondary || '#666',
                fontSize: responsiveValues.fontSize
              }}
              noOfSections={4}
              maxValue={maxRevenue * 1.15}
              yAxisLabelTexts={
                Array.from({ length: 5 }, (_, i) => {
                  const value = (maxRevenue * 1.15 * i) / 4;
                  return formatRevenueYLabel(value.toFixed(1));
                })
              }
              height={responsiveValues.chartHeight}
              width={responsiveValues.chartWidth}
              isAnimated
              animationDuration={1200}
              showValuesAsTopLabel
              barBorderRadius={4}
              lineData={revenueLineData}
              lineConfig={{
                color: colors.warning || '#FF9500',
                thickness: 2,
                curved: true,
                hideDataPoints: false,
                dataPointsColor: colors.warning || '#FF9500',
                dataPointsRadius: 4,
              }}
              topLabelTextStyle={{
                fontSize: 10,
                color: colors.text.primary,
                textAlign: 'center',
              }}
            />
          </View>
        </View>
      ) : (
        // Vertical layout for mobile - Full Width Charts
        <>
          {/* Transaction Chart */}
          <View style={[styles.chartSection, { marginBottom: responsiveValues.sectionMargin }]}>
            <View style={styles.chartHeader}>
              <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
              <Text style={styles.chartTitle}>{t('screen.revenueReport.chart.transactions')}</Text>
            </View>
            <View style={styles.chartWrapper}>
              <BarChart
                data={transactionChartData}
                barWidth={responsiveValues.barWidth}
                spacing={responsiveValues.barSpacing}
                roundedTop
                hideRules={false}
                rulesColor={colors.lightGray}
                rulesType="solid"
                xAxisThickness={1}
                xAxisColor={colors.border || '#E5E5E5'}
                yAxisThickness={0}
                yAxisTextStyle={{ ...typography.caption, color: colors.text?.secondary || '#666', fontSize: responsiveValues.fontSize }}
                xAxisLabelTextStyle={{ ...typography.caption, color: colors.text?.secondary || '#666', fontSize: responsiveValues.fontSize }}
                noOfSections={4}
                maxValue={maxTransactions * 1.2}
                height={responsiveValues.chartHeight}
                width={responsiveValues.chartWidth}
                isAnimated
                animationDuration={800}
                showValuesAsTopLabel
                barBorderRadius={6}
                topLabelTextStyle={{
                  fontSize: 10,
                  color: colors.text.primary,
                  textAlign: 'center',
                  fontWeight: '600',
                }}
                initialSpacing={10}
                endSpacing={10}
              />
            </View>
          </View>

          {/* Revenue Chart with Line */}
          <View style={styles.chartSection}>
            <View style={styles.chartHeader}>
              <View style={[styles.legendColor, { backgroundColor: colors.success }]} />
              <Text style={styles.chartTitle}>{t('screen.revenueReport.chart.revenue')}</Text>
            </View>
            <View style={styles.chartWrapper}>
              <BarChart
                data={revenueChartData}
                barWidth={responsiveValues.barWidth}
                spacing={responsiveValues.barSpacing}
                roundedTop
                hideRules={false}
                rulesColor={colors.lightGray}
                rulesType="solid"
                xAxisThickness={1}
                xAxisColor={colors.border || '#E5E5E5'}
                yAxisThickness={0}
                yAxisTextStyle={{ ...typography.caption, color: colors.text?.secondary || '#666', fontSize: responsiveValues.fontSize }}
                xAxisLabelTextStyle={{ ...typography.caption, color: colors.text?.secondary || '#666', fontSize: responsiveValues.fontSize }}
                noOfSections={4}
                maxValue={maxRevenue * 1.2}
                yAxisLabelTexts={
                  Array.from({ length: 5 }, (_, i) => {
                    const value = (maxRevenue * 1.2 * i) / 4;
                    return formatRevenueYLabel(value.toFixed(1));
                  })
                }
                height={responsiveValues.chartHeight}
                width={responsiveValues.chartWidth}
                isAnimated
                animationDuration={800}
                showValuesAsTopLabel
                barBorderRadius={6}
                lineData={revenueLineData}
                lineConfig={{
                  color: colors.warning || '#FF9500',
                  thickness: 2,
                  curved: true,
                  hideDataPoints: false,
                  dataPointsColor: colors.warning || '#FF9500',
                  dataPointsRadius: 5,
                }}
                topLabelTextStyle={{
                  fontSize: 10,
                  color: colors.text.primary,
                  textAlign: 'center',
                  fontWeight: '600',
                }}
                initialSpacing={10}
                endSpacing={10}
              />
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  tabletContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '100%',
  },
  tabletChartSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.sm,
  },
  chartSection: {
    marginBottom: spacing.lg,
    width: '100%',
  },
  chartWrapper: {
    width: '100%',
    alignItems: 'flex-start',
    paddingLeft: spacing.xs,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  chartTitle: {
    ...typography.subtitle,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  legendColor: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  topLabelText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.text.primary,
    textAlign: 'center',
  },
});

export default RevenueOrdersChart;
