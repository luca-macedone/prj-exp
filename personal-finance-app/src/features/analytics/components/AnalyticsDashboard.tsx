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
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Caricamento analytics...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Nessun dato disponibile</Text>
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
    legendFontColor: '#7F8C8D',
    legendFontSize: 12
  }));

  // Dati per Line Chart
  const lineData = {
    labels: data.trendData.map(t => t.date),
    datasets: [
      {
        data: data.trendData.map(t => t.expenses),
        color: (opacity = 1) => `rgba(231, 76, 60, ${opacity})`,
        strokeWidth: 2
      },
      {
        data: data.trendData.map(t => t.income),
        color: (opacity = 1) => `rgba(39, 174, 96, ${opacity})`,
        strokeWidth: 2
      }
    ],
    legend: ['Spese', 'Entrate']
  };

  return (
    <ScrollView style={styles.container}>
      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <SummaryCard
          title="Entrate"
          amount={data.totalIncome}
          color="#27AE60"
          icon="💰"
        />
        <SummaryCard
          title="Spese"
          amount={data.totalExpenses}
          color="#E74C3C"
          icon="💸"
        />
        <SummaryCard
          title="Bilancio"
          amount={data.balance}
          color={data.balance >= 0 ? '#3498DB' : '#E74C3C'}
          icon={data.balance >= 0 ? '📈' : '📉'}
        />
      </View>

      {/* Spese per Categoria */}
      {pieData.length > 0 && (
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Spese per Categoria</Text>
          <PieChart
            data={pieData}
            width={screenWidth - 32}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft={15}
            absolute
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
          <Text style={styles.chartTitle}>Trend Entrate vs Spese</Text>
          <LineChart
            data={lineData}
            width={screenWidth - 32}
            height={220}
            chartConfig={{
              backgroundColor: '#FFFFFF',
              backgroundGradientFrom: '#FFFFFF',
              backgroundGradientTo: '#FFFFFF',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(127, 140, 141, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: 4,
                strokeWidth: 2
              }
            }}
            bezier
            style={styles.lineChart}
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
  icon: string;
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
    <View style={[styles.summaryCard, { borderLeftColor: color }]}>
      <Text style={styles.summaryIcon}>{icon}</Text>
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
    backgroundColor: '#F5F7FA'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666'
  },
  emptyText: {
    fontSize: 18,
    color: '#666'
  },
  summaryContainer: {
    padding: 16,
    gap: 12
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  summaryIcon: {
    fontSize: 32,
    marginRight: 16
  },
  summaryContent: {
    flex: 1
  },
  summaryTitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '700'
  },
  chartSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 16
  },
  lineChart: {
    marginVertical: 8,
    borderRadius: 16
  },
  categoryList: {
    marginTop: 16
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1'
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12
  },
  categoryName: {
    fontSize: 15,
    color: '#2C3E50',
    fontWeight: '500'
  },
  categoryRight: {
    alignItems: 'flex-end'
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 2
  },
  categoryPercentage: {
    fontSize: 13,
    color: '#7F8C8D'
  }
});
