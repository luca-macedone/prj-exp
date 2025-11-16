/**
 * useAnalytics Hook
 * Calcola statistiche e analytics dai dati finanziari
 */

import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '../../../types';
import SecureDatabase from '../../../services/storage/SecureDatabase';
import dayjs from 'dayjs';
import Big from 'big.js';

interface AnalyticsData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  categoryBreakdown: CategorySpending[];
  trendData: TrendPoint[];
  topExpenses: Transaction[];
}

interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

interface TrendPoint {
  date: string;
  income: number;
  expenses: number;
  balance: number;
}

interface UseAnalyticsResult {
  data: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  refreshAnalytics: () => Promise<void>;
  getAnalyticsForPeriod: (startDate: number, endDate: number) => Promise<AnalyticsData>;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Food': '#FF6B6B',
  'Transport': '#4ECDC4',
  'Shopping': '#FFD93D',
  'Bills': '#6C5CE7',
  'Entertainment': '#FF8787',
  'Health': '#A8E6CF',
  'Education': '#95E1D3',
  'Salary': '#4CAF50',
  'Investment': '#00BCD4',
  'Other': '#95A5A6'
};

export const useAnalytics = (period: 'week' | 'month' | 'year' = 'month'): UseAnalyticsResult => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Calcola analytics per il periodo specificato
   */
  const calculateAnalytics = useCallback(async (startDate: number, endDate: number): Promise<AnalyticsData> => {
    await SecureDatabase.initialize();

    // Recupera transazioni per il periodo
    const transactions = await SecureDatabase.getTransactionsByDateRange(startDate, endDate);

    // Calcola totali con precisione usando big.js
    let totalIncome = new Big(0);
    let totalExpenses = new Big(0);

    const categoryMap = new Map<string, Big>();

    for (const transaction of transactions) {
      const amount = new Big(transaction.amount);

      if (amount.gt(0)) {
        // Income
        totalIncome = totalIncome.plus(amount);
      } else {
        // Expense
        totalExpenses = totalExpenses.plus(amount.abs());

        // Raggruppa per categoria
        const current = categoryMap.get(transaction.category) || new Big(0);
        categoryMap.set(transaction.category, current.plus(amount.abs()));
      }
    }

    // Calcola balance
    const balance = totalIncome.minus(totalExpenses);

    // Categoria breakdown con percentuali
    const totalExpensesNum = totalExpenses.toNumber();
    const categoryBreakdown: CategorySpending[] = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount: amount.toNumber(),
        percentage: totalExpensesNum > 0 ? (amount.toNumber() / totalExpensesNum) * 100 : 0,
        color: CATEGORY_COLORS[category] || '#95A5A6'
      }))
      .sort((a, b) => b.amount - a.amount);

    // Top 5 spese
    const topExpenses = transactions
      .filter(t => t.amount < 0)
      .sort((a, b) => a.amount - b.amount)
      .slice(0, 5);

    // Trend data (giornaliero per settimana, settimanale per mese, mensile per anno)
    const trendData = calculateTrendData(transactions, startDate, endDate, period);

    return {
      totalIncome: totalIncome.toNumber(),
      totalExpenses: totalExpenses.toNumber(),
      balance: balance.toNumber(),
      categoryBreakdown,
      trendData,
      topExpenses
    };
  }, [period]);

  /**
   * Carica analytics per il periodo corrente
   */
  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { startDate, endDate } = getPeriodDates(period);
      const analyticsData = await calculateAnalytics(startDate, endDate);

      setData(analyticsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics';
      setError(errorMessage);
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [period, calculateAnalytics]);

  /**
   * Refresh manuale analytics
   */
  const refreshAnalytics = useCallback(async () => {
    await loadAnalytics();
  }, [loadAnalytics]);

  /**
   * Recupera analytics per periodo personalizzato
   */
  const getAnalyticsForPeriod = useCallback(async (
    startDate: number,
    endDate: number
  ): Promise<AnalyticsData> => {
    try {
      setError(null);
      return await calculateAnalytics(startDate, endDate);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get analytics';
      setError(errorMessage);
      console.error('Error getting analytics:', err);
      throw err;
    }
  }, [calculateAnalytics]);

  // Carica analytics all'inizializzazione
  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return {
    data,
    loading,
    error,
    refreshAnalytics,
    getAnalyticsForPeriod
  };
};

/**
 * Calcola date inizio/fine per il periodo
 */
const getPeriodDates = (period: 'week' | 'month' | 'year'): { startDate: number; endDate: number } => {
  const now = dayjs();

  switch (period) {
    case 'week':
      return {
        startDate: now.startOf('week').valueOf(),
        endDate: now.endOf('week').valueOf()
      };

    case 'month':
      return {
        startDate: now.startOf('month').valueOf(),
        endDate: now.endOf('month').valueOf()
      };

    case 'year':
      return {
        startDate: now.startOf('year').valueOf(),
        endDate: now.endOf('year').valueOf()
      };
  }
};

/**
 * Calcola trend data per grafici temporali
 */
const calculateTrendData = (
  transactions: Transaction[],
  startDate: number,
  endDate: number,
  period: 'week' | 'month' | 'year'
): TrendPoint[] => {
  const points: TrendPoint[] = [];
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  // Determina granularità
  const granularity = period === 'week' ? 'day' : period === 'month' ? 'day' : 'month';
  let current = start;

  while (current.isBefore(end) || current.isSame(end, granularity)) {
    const periodStart = current.startOf(granularity).valueOf();
    const periodEnd = current.endOf(granularity).valueOf();

    // Filtra transazioni per questo periodo
    const periodTransactions = transactions.filter(
      t => t.date >= periodStart && t.date <= periodEnd
    );

    // Calcola totali
    let income = new Big(0);
    let expenses = new Big(0);

    for (const t of periodTransactions) {
      const amount = new Big(t.amount);
      if (amount.gt(0)) {
        income = income.plus(amount);
      } else {
        expenses = expenses.plus(amount.abs());
      }
    }

    const balance = income.minus(expenses);

    points.push({
      date: current.format(granularity === 'day' ? 'DD/MM' : 'MMM'),
      income: income.toNumber(),
      expenses: expenses.toNumber(),
      balance: balance.toNumber()
    });

    current = current.add(1, granularity);
  }

  return points;
};
