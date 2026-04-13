import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors, spacing, typography, borderRadius } from '../theme';
import { formatPrice, formatDate } from '../utils/formatters';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - spacing.md * 2;
const PERIODS = [
  { label: '1D', days: 1 },
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
  { label: '1Y', days: 365 },
];

export default function PriceChart({ onPeriodChange, historicalData, loading, isPositive }) {
  const [activePeriod, setActivePeriod] = useState(7);

  const handlePeriodChange = (days) => {
    setActivePeriod(days);
    onPeriodChange && onPeriodChange(days);
  };

  const chartColor = isPositive ? colors.positive : colors.negative;

  const prices = (historicalData?.prices || []).map(([, p]) => p);
  const labels = (historicalData?.prices || []).map(([ts]) => formatDate(ts));

  // Reduce data points for performance
  const maxPoints = 20;
  const step = prices.length > maxPoints ? Math.floor(prices.length / maxPoints) : 1;
  const reducedPrices = prices.filter((_, i) => i % step === 0);
  const reducedLabels = labels.filter((_, i) => i % step === 0);

  const hasData = reducedPrices.length >= 2;

  return (
    <View style={styles.container}>
      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {PERIODS.map(({ label, days }) => (
          <TouchableOpacity
            key={days}
            style={[styles.periodBtn, activePeriod === days && styles.activePeriodBtn]}
            onPress={() => handlePeriodChange(days)}
          >
            <Text style={[styles.periodText, activePeriod === days && { color: colors.text.primary }]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : hasData ? (
        <LineChart
          data={{
            labels: reducedLabels.filter((_, i) => i % Math.ceil(reducedLabels.length / 5) === 0 || i === reducedLabels.length - 1),
            datasets: [{ data: reducedPrices, color: () => chartColor, strokeWidth: 2 }],
          }}
          width={CHART_WIDTH}
          height={180}
          withDots={false}
          withInnerLines={false}
          withOuterLines={false}
          withVerticalLabels={true}
          withHorizontalLabels={false}
          chartConfig={{
            backgroundGradientFrom: colors.surface,
            backgroundGradientTo: colors.surface,
            color: () => chartColor,
            labelColor: () => colors.text.tertiary,
            propsForLabels: { fontSize: 9 },
            decimalPlaces: reducedPrices[0] >= 100 ? 0 : 4,
          }}
          bezier
          style={styles.chart}
        />
      ) : (
        <View style={styles.loadingBox}>
          <Text style={styles.noDataText}>No chart data available</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: 3,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  activePeriodBtn: { backgroundColor: colors.primary },
  periodText: { ...typography.caption, color: colors.text.secondary, fontWeight: '600' },
  chart: { borderRadius: borderRadius.md, marginTop: spacing.xs },
  loadingBox: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: { ...typography.body, color: colors.text.secondary },
});
