/**
 * AnalyticsDashboard Component
 * Dashboard con statistiche finanziarie e grafici
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../../theme';

interface AnalyticsDashboardProps {
  data: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    categoryBreakdown: Array<{
      category: string;
      amount: number;
      percentage: number;
      color: string;
    }>;
    trendData: Array<{
      date: string;
      income: number;
      expenses: number;
      balance: number;
    }>;
  } | null;
  loading?: boolean;
}

const screenWidth = Dimensions.get('window').width;

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  data,
  loading = false
}) => {
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Caricamento analytics...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="analytics-outline" size={80} color={colors.text.tertiary} />
        </View>
        <Text style={styles.emptyText}>Nessun dato disponibile</Text>
        <Text style={styles.emptySubtext}>
          Aggiungi transazioni per vedere{'\\n'}le tue statistiche finanziarie
        </Text>
      </View>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Dati per Pie Chart
  const pieData = data.categoryBreakdown.slice(0, 6).map(item => ({
    name: item.category,
    population: item.amount,
    color: item.color,
    legendFontColor: colors.text.secondary,
    legendFontSize: 13
  }));

  // Dati per Line Chart
  const lineData = {
    labels: data.trendData.map(t => t.date),
    datasets: [
      {
        data: data.trendData.map(t => t.expenses),
        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // colors.error
        strokeWidth: 3
      },
      {
        data: data.trendData.map(t => t.income),
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // colors.success
        strokeWidth: 3
      }
    ],
    legend: ['Spese', 'Entrate']
  };

  return (
    <ScrollView style={styles.container}>
      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <SummaryCard
          title="Entrate totali"
          amount={data.totalIncome}
          color={colors.success}
          icon="trending-up"
        />
        <SummaryCard
          title="Spese totali"
          amount={data.totalExpenses}
          color={colors.error}
          icon="trending-down"
        />
        <SummaryCard
          title="Bilancio netto"
          amount={data.balance}
          color={data.balance >= 0 ? colors.info : colors.error}
          icon={data.balance >= 0 ? 'checkmark-circle' : 'alert-circle'}
        />
      </View>

      {/* Spese per Categoria */}
      {pieData.length > 0 && (
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Ionicons name="pie-chart" size={24} color={colors.primary} />
            <Text style={styles.chartTitle}>Spese per Categoria</Text>
          </View>
          <PieChart
            data={pieData}
            width={screenWidth - 64}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`
            }}
            accessor="population"
            backgroundColor="transparent"
            // @ts-expect-error - paddingLeft type is incorrectly defined as string in library, but needs number at runtime
            paddingLeft={15}
            absolute
            hasLegend={false}
          />

          {/* Categoria List */}
          <View style={styles.categoryList}>
            {data.categoryBreakdown.slice(0, 5).map((item, index) => (
              <View key={index} style={styles.categoryItem}>
                <View style={styles.categoryLeft}>
                  <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                  <Text style={styles.categoryName}>{item.category}</Text>
                </View>
                <View style={styles.categoryRight}>
                  <Text style={styles.categoryAmount}>{formatCurrency(item.amount)}</Text>
                  <Text style={styles.categoryPercentage}>
                    {item.percentage.toFixed(0)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Trend Temporale */}
      {data.trendData.length > 0 && (
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Ionicons name="stats-chart" size={24} color={colors.primary} />
            <Text style={styles.chartTitle}>Trend Entrate vs Spese</Text>
          </View>
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <Text style={styles.legendText}>Entrate</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
              <Text style={styles.legendText}>Spese</Text>
            </View>
          </View>
          <LineChart
            data={lineData}
            width={screenWidth - 64}
            height={220}
            chartConfig={{
              backgroundColor: 'transparent',
              backgroundGradientFrom: colors.background.card,
              backgroundGradientTo: colors.background.card,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(160, 174, 192, ${opacity})`,
              labelColor: (opacity = 1) => colors.text.secondary,
              style: {
                borderRadius: borderRadius.lg
              },
              propsForDots: {
                r: 5,
                strokeWidth: 2,
                stroke: colors.background.card
              },
              propsForBackgroundLines: {
                strokeDasharray: '',
                stroke: colors.background.secondary,
                strokeWidth: 1
              }
            }}
            bezier
            style={styles.lineChart}
            withShadow={false}
            withInnerLines={true}
            withOuterLines={false}
          />
        </View>
      )}
    </ScrollView>
  );
};

interface SummaryCardProps {
  title: string;
  amount: number;
  color: string;
  icon: any;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, color, icon }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <View style={styles.summaryCard}>
      <View style={[styles.summaryIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View style={styles.summaryContent}>
        <Text style={styles.summaryTitle}>{title}</Text>
        <Text style={[styles.summaryAmount, { color }]}>
          {formatCurrency(amount)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.text.secondary
  },
  emptyIconContainer: {
    marginBottom: spacing.xxl
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md
  },
  emptySubtext: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22
  },
  summaryContainer: {
    padding: spacing.lg,
    gap: spacing.md
  },
  summaryCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...colors.shadow.md
  },
  summaryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md
  },
  summaryContent: {
    flex: 1
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 6
  },
  summaryAmount: {
    fontSize: 26,
    fontWeight: '700'
  },
  chartSection: {
    backgroundColor: colors.background.card,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...colors.shadow.md
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    flex: 1
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    marginBottom: spacing.md
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6
  },
  legendText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary
  },
  lineChart: {
    marginVertical: spacing.sm,
    borderRadius: borderRadius.lg
  },
  categoryList: {
    marginTop: spacing.lg
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: spacing.md
  },
  categoryName: {
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: '600'
  },
  categoryRight: {
    alignItems: 'flex-end'
  },
  categoryAmount: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4
  },
  categoryPercentage: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary
  }
});
