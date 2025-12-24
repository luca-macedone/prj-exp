/**
 * BudgetList Component
 * Visualizza lista di budget con indicatori visivi per overspending
 */

import React from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Budget } from '../../../types';
import { BudgetStatus } from '../hooks/useBudgets';

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
    />
  );

  const keyExtractor = (item: Budget) => item.id;

  if (loading && budgets.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Caricamento budget...</Text>
      </View>
    );
  }

  if (budgets.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="wallet-outline" size={80} color="#CBD5E0" />
        </View>
        <Text style={styles.emptyText}>Nessun budget configurato</Text>
        <Text style={styles.emptySubtext}>
          Imposta limiti di spesa per categoria{'\n'}e monitora i tuoi progressi{'\n'}verso i tuoi obiettivi finanziari
        </Text>
        <View style={styles.emptyTips}>
          <View style={styles.tipItem}>
            <Ionicons name="trophy" size={20} color="#F39C12" />
            <Text style={styles.tipText}>Raggiungi i tuoi obiettivi di risparmio</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="shield-checkmark" size={20} color="#3498DB" />
            <Text style={styles.tipText}>Evita spese eccessive</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="trending-up" size={20} color="#27AE60" />
            <Text style={styles.tipText}>Migliora le tue abitudini finanziarie</Text>
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
      contentContainerStyle={styles.listContainer}
    />
  );
};

interface BudgetCardProps {
  budget: Budget;
  status: BudgetStatus;
  onPress?: () => void;
}

const BudgetCard: React.FC<BudgetCardProps> = ({ budget, status }) => {
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
    const colors: Record<string, string> = {
      'Food': '#FF6B6B',
      'Transport': '#4ECDC4',
      'Shopping': '#FFD93D',
      'Bills': '#6C5CE7',
      'Entertainment': '#FF8787',
      'Health': '#A8E6CF',
    };
    return colors[category] || '#95A5A6';
  };

  const categoryIcon = getCategoryIcon(budget.category);
  const categoryColor = getCategoryColor(budget.category);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.categoryIconWrapper}>
          <View style={[styles.categoryIcon, { backgroundColor: categoryColor + '20' }]}>
            <Ionicons name={categoryIcon} size={28} color={categoryColor} />
          </View>
        </View>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{budget.category}</Text>
          <Text style={styles.periodLabel}>{getPeriodLabel(budget.period)}</Text>
        </View>
        <View style={styles.amountInfo}>
          <Text style={[styles.spent, status.isOverBudget && styles.overBudget]}>
            {formatCurrency(status.spent)}
          </Text>
          <Text style={styles.limit}>di {formatCurrency(status.limit)}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${status.percentage}%`,
              backgroundColor: getProgressColor()
            }
          ]}
        />
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <Text style={styles.remaining}>
          {status.isOverBudget ? (
            <>Superato di {formatCurrency(Math.abs(status.remaining))}</>
          ) : (
            <>Rimanente: {formatCurrency(status.remaining)}</>
          )}
        </Text>
        <Text style={[styles.percentage, { color: getProgressColor() }]}>
          {status.percentage.toFixed(0)}%
        </Text>
      </View>

      {/* Warning badge */}
      {status.isWarning && !status.isOverBudget && (
        <View style={styles.warningBadge}>
          <Text style={styles.warningText}>⚠️ Vicino al limite</Text>
        </View>
      )}

      {status.isOverBudget && (
        <View style={styles.overBudgetBadge}>
          <Text style={styles.overBudgetText}>🚨 Budget superato</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666'
  },
  emptyIconContainer: {
    marginBottom: 24
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12
  },
  emptySubtext: {
    fontSize: 15,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32
  },
  emptyTips: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  tipText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#2C3E50',
    flex: 1
  },
  listContainer: {
    padding: 16
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  categoryIconWrapper: {
    marginRight: 12
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  categoryInfo: {
    flex: 1
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4
  },
  periodLabel: {
    fontSize: 13,
    color: '#7F8C8D'
  },
  amountInfo: {
    alignItems: 'flex-end'
  },
  spent: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 2
  },
  overBudget: {
    color: '#E74C3C'
  },
  limit: {
    fontSize: 13,
    color: '#7F8C8D'
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#ECF0F1',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12
  },
  progressBar: {
    height: '100%',
    borderRadius: 4
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  remaining: {
    fontSize: 14,
    color: '#7F8C8D'
  },
  percentage: {
    fontSize: 16,
    fontWeight: '700'
  },
  warningBadge: {
    marginTop: 12,
    backgroundColor: '#FFF3CD',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFC107'
  },
  warningText: {
    fontSize: 13,
    color: '#856404',
    textAlign: 'center',
    fontWeight: '600'
  },
  overBudgetBadge: {
    marginTop: 12,
    backgroundColor: '#F8D7DA',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E74C3C'
  },
  overBudgetText: {
    fontSize: 13,
    color: '#721C24',
    textAlign: 'center',
    fontWeight: '600'
  }
});
