/**
 * AnalyticsDashboard Component
 * Dashboard con statistiche finanziarie e grafici con Tailwind
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';

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
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center p-12">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className={`mt-4 text-base ${isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'}`}>
          Caricamento analytics...
        </Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View className="flex-1 justify-center items-center p-12">
        <View className="mb-8">
          <Ionicons name="analytics-outline" size={80} color={isDark ? '#718096' : '#9CA3AF'} />
        </View>
        <Text className={`text-2xl font-bold mb-4 ${isDark ? 'text-text-primary-dark' : 'text-text-primary-light'}`}>
          Nessun dato disponibile
        </Text>
        <Text className={`text-base text-center leading-6 ${isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'}`}>
          Aggiungi transazioni per vedere{'\n'}le tue statistiche finanziarie
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
    legendFontColor: isDark ? '#A0AEC0' : '#6B7280',
    legendFontSize: 13
  }));

  // Dati per Line Chart con label ottimizzate
  const lineData = {
    // Mostra solo ogni 2a o 3a label per evitare sovrapposizioni
    labels: data.trendData.map((t, index) => {
      // Mostra solo alcune date per evitare sovrapposizione
      const step = Math.ceil(data.trendData.length / 6);
      if (index % step === 0 || index === data.trendData.length - 1) {
        return t.date;
      }
      return '';
    }),
    datasets: [
      {
        data: data.trendData.map(t => t.expenses),
        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // colors.error
        strokeWidth: 2.5
      },
      {
        data: data.trendData.map(t => t.income),
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // colors.success
        strokeWidth: 2.5
      }
    ],
    legend: ['Spese', 'Entrate']
  };

  return (
    <ScrollView className={isDark ? 'flex-1 bg-background-primary-dark' : 'flex-1 bg-background-primary-light'}>
      {/* Summary Cards */}
      <View className="p-4 gap-4">
        <SummaryCard
          title="Entrate totali"
          amount={data.totalIncome}
          color="#10B981"
          icon="trending-up"
          isDark={isDark}
        />
        <SummaryCard
          title="Spese totali"
          amount={data.totalExpenses}
          color="#EF4444"
          icon="trending-down"
          isDark={isDark}
        />
        <SummaryCard
          title="Bilancio netto"
          amount={data.balance}
          color={data.balance >= 0 ? '#3B82F6' : '#EF4444'}
          icon={data.balance >= 0 ? 'checkmark-circle' : 'alert-circle'}
          isDark={isDark}
        />
      </View>

      {/* Spese per Categoria */}
      {pieData.length > 0 && (
        <View className={`mx-4 mb-4 rounded-2xl p-4 ${
          isDark ? 'bg-background-card-dark shadow-lg' : 'bg-background-card-light shadow-md'
        }`}>
          <View className="flex-row items-center mb-4 gap-2">
            <Ionicons name="pie-chart" size={24} color="#007AFF" />
            <Text className={`text-lg font-bold flex-1 ${
              isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
            }`}>
              Spese per Categoria
            </Text>
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
          <View className="mt-4">
            {data.categoryBreakdown.slice(0, 5).map((item, index) => (
              <View
                key={index}
                className={`flex-row justify-between items-center py-4 border-b ${
                  isDark ? 'border-background-secondary-dark' : 'border-background-secondary-light'
                }`}
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-3.5 h-3.5 rounded-full mr-4" style={{ backgroundColor: item.color }} />
                  <Text className={`text-base font-semibold ${
                    isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
                  }`}>
                    {item.category}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className={`text-lg font-bold ${
                    isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
                  }`}>
                    {formatCurrency(item.amount)}
                  </Text>
                  <Text className={`text-sm font-semibold ${
                    isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'
                  }`}>
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
        <View className={`mx-4 mb-4 rounded-2xl p-4 ${
          isDark ? 'bg-background-card-dark shadow-lg' : 'bg-background-card-light shadow-md'
        }`}>
          <View className="flex-row items-center mb-4 gap-2">
            <Ionicons name="stats-chart" size={24} color="#007AFF" />
            <Text className={`text-lg font-bold flex-1 ${
              isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
            }`}>
              Trend Entrate vs Spese
            </Text>
          </View>
          <View className="flex-row justify-center gap-6 mb-4">
            <View className="flex-row items-center gap-2">
              <View className="w-3 h-3 rounded-full bg-success" />
              <Text className={`text-sm font-semibold ${
                isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'
              }`}>
                Entrate
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <View className="w-3 h-3 rounded-full bg-error" />
              <Text className={`text-sm font-semibold ${
                isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'
              }`}>
                Spese
              </Text>
            </View>
          </View>
          <View className="items-center">
            <LineChart
              data={lineData}
              width={screenWidth - 64}
              height={240}
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: isDark ? '#1A202C' : '#FFFFFF',
                backgroundGradientTo: isDark ? '#1A202C' : '#FFFFFF',
                decimalPlaces: 0,
                color: (opacity = 1) => isDark ? `rgba(160, 174, 192, ${opacity})` : `rgba(107, 114, 128, ${opacity})`,
                labelColor: (opacity = 1) => isDark ? '#A0AEC0' : '#6B7280',
                style: {
                  borderRadius: 16,
                  paddingRight: 0
                },
                propsForDots: {
                  r: 4,
                  strokeWidth: 2,
                  stroke: isDark ? '#1A202C' : '#FFFFFF'
                },
                propsForBackgroundLines: {
                  strokeDasharray: '',
                  stroke: isDark ? '#2D3748' : '#E5E7EB',
                  strokeWidth: 1
                },
                propsForLabels: {
                  fontSize: 10,
                  fontWeight: '500'
                }
              }}
              bezier
              style={{
                marginVertical: 12,
                borderRadius: 16,
                paddingRight: 0
              }}
              withShadow={false}
              withInnerLines={true}
              withOuterLines={false}
              withHorizontalLabels={true}
              withVerticalLabels={true}
              fromZero
              segments={4}
            />
          </View>
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
  isDark: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, color, icon, isDark }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <View className={`p-4 rounded-2xl flex-row items-center ${
      isDark ? 'bg-background-card-dark shadow-lg' : 'bg-background-card-light shadow-md'
    }`}>
      <View className="w-14 h-14 rounded-xl justify-center items-center mr-4" style={{ backgroundColor: color + '20' }}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View className="flex-1">
        <Text className={`text-sm font-semibold mb-1.5 ${
          isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'
        }`}>
          {title}
        </Text>
        <Text className="text-2xl font-bold" style={{ color }}>
          {formatCurrency(amount)}
        </Text>
      </View>
    </View>
  );
};
