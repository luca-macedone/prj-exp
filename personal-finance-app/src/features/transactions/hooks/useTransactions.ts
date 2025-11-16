/**
 * useTransactions Hook
 * ViewModel per la gestione delle transazioni
 * Implementa pattern MVVM separando UI logic da business logic
 */

import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '../../../types';
import SecureDatabase from '../../../services/storage/SecureDatabase';

interface UseTransactionsResult {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string | null>;
  refreshTransactions: () => Promise<void>;
  getTransactionsByDateRange: (startDate: number, endDate: number) => Promise<Transaction[]>;
}

export const useTransactions = (): UseTransactionsResult => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carica tutte le transazioni dal database locale
   */
  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Inizializza database se necessario
      await SecureDatabase.initialize();

      // Recupera transazioni
      const data = await SecureDatabase.getAllTransactions();
      setTransactions(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load transactions';
      setError(errorMessage);
      console.error('Error loading transactions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Aggiunge una nuova transazione
   */
  const addTransaction = useCallback(async (
    transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string | null> => {
    try {
      setError(null);

      // Validazione base
      if (transaction.amount === 0) {
        throw new Error('Amount cannot be zero');
      }

      if (!transaction.description || transaction.description.trim() === '') {
        throw new Error('Description is required');
      }

      // Inserisce nel database
      const id = await SecureDatabase.insertTransaction(transaction);

      // Ricarica le transazioni
      await loadTransactions();

      return id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add transaction';
      setError(errorMessage);
      console.error('Error adding transaction:', err);
      return null;
    }
  }, [loadTransactions]);

  /**
   * Refresh manuale delle transazioni
   */
  const refreshTransactions = useCallback(async () => {
    await loadTransactions();
  }, [loadTransactions]);

  /**
   * Recupera transazioni per range di date
   */
  const getTransactionsByDateRange = useCallback(async (
    startDate: number,
    endDate: number
  ): Promise<Transaction[]> => {
    try {
      setError(null);
      return await SecureDatabase.getTransactionsByDateRange(startDate, endDate);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get transactions';
      setError(errorMessage);
      console.error('Error getting transactions by date range:', err);
      return [];
    }
  }, []);

  // Carica transazioni all'inizializzazione
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  return {
    transactions,
    loading,
    error,
    addTransaction,
    refreshTransactions,
    getTransactionsByDateRange
  };
};
