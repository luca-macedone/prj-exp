/**
 * BudgetScreen
 * Schermata per visualizzare e gestire budget
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BudgetList } from '../features/budget';
import { QuickBudgetForm } from '../components/QuickBudgetForm';
import { colors, spacing, borderRadius } from '../theme';
import { useData } from '../context/DataContext';

export const BudgetScreen: React.FC = () => {
  const {
    budgets,
    loading,
    addBudget,
    refreshData,
    transactions
  } = useData();

  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Calcola lo stato di un budget
  const getBudgetStatus = (budget: any) => {
    if (!budget) {
      return {
        spent: 0,
        limit: 0,
        remaining: 0,
        percentage: 0,
        isOverBudget: false,
        isWarning: false
      };
    }

    const spent = budget.spent || 0;
    const limit = budget.limit || 0;
    const remaining = limit - spent;
    const percentage = limit > 0 ? (spent / limit) * 100 : 0;
    const isOverBudget = percentage >= 100;
    const isWarning = percentage >= 80 && !isOverBudget;

    return {
      spent,
      limit,
      remaining,
      percentage,
      isOverBudget,
      isWarning
    };
  };

  const handleAddBudget = async (data: {
    category: string;
    limit: number;
    period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  }) => {
    try {
      const result = await addBudget({
        category: data.category,
        limit: data.limit,
        period: data.period,
        startDate: Date.now()
      });

      if (result) {
        setModalVisible(false);
      }
    } catch (err) {
      console.error('Errore creazione budget:', err);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Budget</Text>
          <Text style={styles.headerSubtitle}>
            {budgets.length} budget attivi
          </Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options" size={20} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add-circle" size={24} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Nuovo Budget</Text>
      </TouchableOpacity>

      {/* Error */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color={colors.warning} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Budget List */}
      <BudgetList
        budgets={budgets}
        loading={loading}
        onRefresh={refreshData}
        getBudgetStatus={getBudgetStatus}
        onBudgetPress={(budget) => {
          // TODO: Navigate to budget details
          console.log('Budget pressed:', budget);
        }}
      />

      {/* Quick Budget Form */}
      <QuickBudgetForm
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddBudget}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.text.secondary
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    ...colors.shadow.md
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm
  },
  errorText: {
    flex: 1,
    color: colors.warning,
    fontSize: 14
  }
});
