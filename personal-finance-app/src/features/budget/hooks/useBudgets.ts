/**
 * useBudgets Hook
 * Gestisce i budget con calcolo automatico della spesa corrente
 */

import { useState, useEffect, useCallback } from 'react';
import { Budget } from '../../../types';
import SecureDatabase from '../../../services/storage/SecureDatabase';
import dayjs from 'dayjs';

interface UseBudgetsResult {
  budgets: Budget[];
  loading: boolean;
  error: string | null;
  addBudget: (budget: Omit<Budget, 'id' | 'spent'>) => Promise<string | null>;
  refreshBudgets: () => Promise<void>;
  getBudgetStatus: (budget: Budget) => BudgetStatus;
  getActiveBudgets: () => Promise<Budget[]>;
}

export interface BudgetStatus {
  spent: number;
  limit: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
  isWarning: boolean; // >80% spent
}

export const useBudgets = (): UseBudgetsResult => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carica tutti i budget e calcola spesa corrente
   */
  const loadBudgets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      await SecureDatabase.initialize();

      const allBudgets = await SecureDatabase.getAllBudgets();

      // Aggiorna la spesa corrente per ogni budget
      const updatedBudgets = await Promise.all(
        allBudgets.map(async (budget) => {
          const { startDate, endDate } = getBudgetPeriodDates(budget);
          const spent = await SecureDatabase.getSpendingByCategory(
            budget.category,
            startDate,
            endDate || Date.now()
          );

          // Aggiorna nel database
          await SecureDatabase.updateBudgetSpent(budget.id, spent);

          return { ...budget, spent };
        })
      );

      setBudgets(updatedBudgets);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load budgets';
      setError(errorMessage);
      console.error('Error loading budgets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Aggiunge un nuovo budget
   */
  const addBudget = useCallback(async (
    budget: Omit<Budget, 'id' | 'spent'>
  ): Promise<string | null> => {
    try {
      setError(null);

      // Validazione
      if (budget.limit <= 0) {
        throw new Error('Budget limit must be greater than zero');
      }

      if (!budget.category || budget.category.trim() === '') {
        throw new Error('Category is required');
      }

      // Inserisce nel database
      const id = await SecureDatabase.insertBudget(budget);

      // Ricarica i budget
      await loadBudgets();

      return id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add budget';
      setError(errorMessage);
      console.error('Error adding budget:', err);
      return null;
    }
  }, [loadBudgets]);

  /**
   * Refresh manuale dei budget
   */
  const refreshBudgets = useCallback(async () => {
    await loadBudgets();
  }, [loadBudgets]);

  /**
   * Recupera solo budget attivi
   */
  const getActiveBudgets = useCallback(async (): Promise<Budget[]> => {
    try {
      setError(null);
      return await SecureDatabase.getActiveBudgets();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get active budgets';
      setError(errorMessage);
      console.error('Error getting active budgets:', err);
      return [];
    }
  }, []);

  /**
   * Calcola lo stato del budget (speso, rimanente, percentuale)
   */
  const getBudgetStatus = useCallback((budget: Budget): BudgetStatus => {
    const spent = budget.spent || 0;
    const limit = budget.limit;
    const remaining = limit - spent;
    const percentage = limit > 0 ? (spent / limit) * 100 : 0;
    const isOverBudget = spent > limit;
    const isWarning = percentage >= 80 && !isOverBudget;

    return {
      spent,
      limit,
      remaining,
      percentage: Math.min(percentage, 100),
      isOverBudget,
      isWarning
    };
  }, []);

  /**
   * Calcola le date di inizio/fine del periodo budget
   */
  const getBudgetPeriodDates = (budget: Budget): { startDate: number; endDate: number | null } => {
    const now = dayjs();
    const start = dayjs(budget.startDate);

    switch (budget.period) {
      case 'daily':
        return {
          startDate: now.startOf('day').valueOf(),
          endDate: now.endOf('day').valueOf()
        };

      case 'weekly':
        return {
          startDate: now.startOf('week').valueOf(),
          endDate: now.endOf('week').valueOf()
        };

      case 'monthly':
        return {
          startDate: now.startOf('month').valueOf(),
          endDate: now.endOf('month').valueOf()
        };

      case 'yearly':
        return {
          startDate: now.startOf('year').valueOf(),
          endDate: now.endOf('year').valueOf()
        };

      default:
        return {
          startDate: budget.startDate,
          endDate: budget.endDate || null
        };
    }
  };

  // Carica budget all'inizializzazione
  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  return {
    budgets,
    loading,
    error,
    addBudget,
    refreshBudgets,
    getBudgetStatus,
    getActiveBudgets
  };
};
