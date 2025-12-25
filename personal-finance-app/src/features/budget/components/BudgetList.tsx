/**
 * BudgetList Component
 * Visualizza lista di budget con indicatori visivi per overspending (Tailwind)
 */

import React from 'react';
import {
  FlatList,
  View,
  Text,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Budget } from '../../../types';
import { BudgetStatus } from '../hooks/useBudgets';
import { useTheme } from '../../../context/ThemeContext';

interface BudgetListProps {
  budgets: Budget[];
  loading?: boolean;
  onRefresh?: () => Promise<void>;
  getBudgetStatus: (budget: Budget) => BudgetStatus;
  onBudgetPress?: (budget: Budget) => void;
}

export const BudgetList: React.FC<BudgetListProps> = ({
  budgets,
  loading = false,
  onRefresh,
  getBudgetStatus,
  onBudgetPress
}) => {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
  };

  const renderItem = ({ item }: { item: Budget }) => (
    <BudgetCard
      budget={item}
      status={getBudgetStatus(item)}
      onPress={() => onBudgetPress?.(item)}
      isDark={isDark}
    />
  );

  const keyExtractor = (item: Budget) => item.id;

  if (loading && budgets.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-12">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className={`mt-4 text-base ${isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'}`}>
          Caricamento budget...
        </Text>
      </View>
    );
  }

  if (budgets.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-12">
        <View className="mb-8">
          <Ionicons name="wallet-outline" size={80} color={isDark ? '#718096' : '#9CA3AF'} />
        </View>
        <Text className={`text-2xl font-bold mb-4 ${isDark ? 'text-text-primary-dark' : 'text-text-primary-light'}`}>
          Nessun budget configurato
        </Text>
        <Text className={`text-base text-center leading-6 mb-12 ${isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'}`}>
          Imposta limiti di spesa per categoria{'\n'}e monitora i tuoi progressi{'\n'}verso i tuoi obiettivi finanziari
        </Text>
        <View className={`w-full rounded-xl p-6 ${isDark ? 'bg-background-secondary-dark' : 'bg-background-secondary-light'}`}>
          <View className="flex-row items-center mb-4">
            <Ionicons name="trophy" size={20} color="#F59E0B" />
            <Text className={`ml-4 text-sm flex-1 ${isDark ? 'text-text-primary-dark' : 'text-text-primary-light'}`}>
              Raggiungi i tuoi obiettivi di risparmio
            </Text>
          </View>
          <View className="flex-row items-center mb-4">
            <Ionicons name="shield-checkmark" size={20} color="#3B82F6" />
            <Text className={`ml-4 text-sm flex-1 ${isDark ? 'text-text-primary-dark' : 'text-text-primary-light'}`}>
              Evita spese eccessive
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="trending-up" size={20} color="#10B981" />
            <Text className={`ml-4 text-sm flex-1 ${isDark ? 'text-text-primary-dark' : 'text-text-primary-light'}`}>
              Migliora le tue abitudini finanziarie
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <FlatList
      data={budgets}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        ) : undefined
      }
      contentContainerStyle={{ padding: 16 }}
    />
  );
};

interface BudgetCardProps {
  budget: Budget;
  status: BudgetStatus;
  onPress?: () => void;
  isDark: boolean;
}

const BudgetCard: React.FC<BudgetCardProps> = ({ budget, status, isDark }) => {
  const getProgressColor = () => {
    if (status.isOverBudget) return '#E74C3C';
    if (status.isWarning) return '#F39C12';
    return '#27AE60';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getPeriodLabel = (period: string) => {
    const labels: Record<string, string> = {
      daily: 'Giornaliero',
      weekly: 'Settimanale',
      monthly: 'Mensile',
      yearly: 'Annuale'
    };
    return labels[period] || period;
  };

  const getCategoryIcon = (category: string): any => {
    const icons: Record<string, any> = {
      'Food': 'restaurant',
      'Transport': 'car',
      'Shopping': 'cart',
      'Bills': 'receipt',
      'Entertainment': 'game-controller',
      'Health': 'medkit',
      'Other': 'ellipsis-horizontal'
    };
    return icons[category] || 'ellipsis-horizontal';
  };

  const getCategoryColor = (category: string): string => {
    const categoryColors: Record<string, string> = {
      'Food': '#FF6B6B',
      'Transport': '#4ECDC4',
      'Shopping': '#FFE66D',
      'Bills': '#95E1D3',
      'Entertainment': '#F38181',
      'Health': '#AA96DA',
      'Other': '#95A5A6'
    };
    return categoryColors[category] || categoryColors.Other;
  };

  const categoryIcon = getCategoryIcon(budget.category);
  const categoryColor = getCategoryColor(budget.category);

  return (
    <View className={`p-4 rounded-2xl mb-4 ${
      isDark ? 'bg-background-card-dark shadow-lg' : 'bg-background-card-light shadow-md'
    }`}>
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <View className="mr-3">
          <View className="w-13 h-13 rounded-xl justify-center items-center" style={{ backgroundColor: categoryColor + '20' }}>
            <Ionicons name={categoryIcon} size={28} color={categoryColor} />
          </View>
        </View>
        <View className="flex-1">
          <Text className={`text-lg font-bold mb-1 ${
            isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
          }`}>
            {budget.category}
          </Text>
          <Text className={`text-sm ${
            isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'
          }`}>
            {getPeriodLabel(budget.period)}
          </Text>
        </View>
        <View className="items-end">
          <Text className={`text-xl font-bold mb-0.5 ${
            status.isOverBudget ? 'text-error' : (isDark ? 'text-text-primary-dark' : 'text-text-primary-light')
          }`}>
            {formatCurrency(status.spent)}
          </Text>
          <Text className={`text-sm ${
            isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'
          }`}>
            di {formatCurrency(status.limit)}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View className={`h-2 rounded-sm overflow-hidden mb-4 ${
        isDark ? 'bg-background-secondary-dark' : 'bg-background-secondary-light'
      }`}>
        <View
          className="h-full rounded-sm"
          style={{
            width: `${status.percentage}%`,
            backgroundColor: getProgressColor()
          }}
        />
      </View>

      {/* Footer */}
      <View className="flex-row justify-between items-center">
        <Text className={`text-sm ${
          isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'
        }`}>
          {status.isOverBudget ? (
            <>Superato di {formatCurrency(Math.abs(status.remaining))}</>
          ) : (
            <>Rimanente: {formatCurrency(status.remaining)}</>
          )}
        </Text>
        <Text className="text-base font-bold" style={{ color: getProgressColor() }}>
          {status.percentage.toFixed(0)}%
        </Text>
      </View>

      {/* Warning badge */}
      {status.isWarning && !status.isOverBudget && (
        <View className="mt-4 px-2 py-2 rounded-sm border" style={{ backgroundColor: '#F39C12' + '20', borderColor: '#F39C12' }}>
          <Text className="text-sm text-center font-semibold" style={{ color: '#F39C12' }}>
            ⚠️ Vicino al limite
          </Text>
        </View>
      )}

      {status.isOverBudget && (
        <View className="mt-4 px-2 py-2 rounded-sm border border-error" style={{ backgroundColor: '#EF4444' + '20' }}>
          <Text className="text-sm text-error text-center font-semibold">
            🚨 Budget superato
          </Text>
        </View>
      )}
    </View>
  );
};
