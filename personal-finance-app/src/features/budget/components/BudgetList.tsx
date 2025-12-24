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
import { colors, spacing, borderRadius } from '../../../theme';

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
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Caricamento budget...</Text>
      </View>
    );
  }

  if (budgets.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="wallet-outline" size={80} color={colors.text.tertiary} />
        </View>
        <Text style={styles.emptyText}>Nessun budget configurato</Text>
        <Text style={styles.emptySubtext}>
          Imposta limiti di spesa per categoria{'\n'}e monitora i tuoi progressi{'\n'}verso i tuoi obiettivi finanziari
        </Text>
        <View style={styles.emptyTips}>
          <View style={styles.tipItem}>
            <Ionicons name="trophy" size={20} color={colors.warning} />
            <Text style={styles.tipText}>Raggiungi i tuoi obiettivi di risparmio</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="shield-checkmark" size={20} color={colors.info} />
            <Text style={styles.tipText}>Evita spese eccessive</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="trending-up" size={20} color={colors.success} />
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
    return colors.categories[category as keyof typeof colors.categories] || colors.categories.Other;
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
    lineHeight: 22,
    marginBottom: spacing.xxxl
  },
  emptyTips: {
    width: '100%',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.xl
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  tipText: {
    marginLeft: spacing.md,
    fontSize: 14,
    color: colors.text.primary,
    flex: 1
  },
  listContainer: {
    padding: spacing.lg
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...colors.shadow.md
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
    color: colors.text.primary,
    marginBottom: 4
  },
  periodLabel: {
    fontSize: 13,
    color: colors.text.secondary
  },
  amountInfo: {
    alignItems: 'flex-end'
  },
  spent: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2
  },
  overBudget: {
    color: colors.error
  },
  limit: {
    fontSize: 13,
    color: colors.text.secondary
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginBottom: spacing.md
  },
  progressBar: {
    height: '100%',
    borderRadius: borderRadius.sm
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  remaining: {
    fontSize: 14,
    color: colors.text.secondary
  },
  percentage: {
    fontSize: 16,
    fontWeight: '700'
  },
  warningBadge: {
    marginTop: spacing.md,
    backgroundColor: colors.warning + '20',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.warning
  },
  warningText: {
    fontSize: 13,
    color: colors.warning,
    textAlign: 'center',
    fontWeight: '600'
  },
  overBudgetBadge: {
    marginTop: spacing.md,
    backgroundColor: colors.error + '20',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.error
  },
  overBudgetText: {
    fontSize: 13,
    color: colors.error,
    textAlign: 'center',
    fontWeight: '600'
  }
});
