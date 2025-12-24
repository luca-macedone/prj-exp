/**
 * DataContext - Context globale per gestire dati reattivi
 * Sincronizza transazioni, budget e analytics in tutta l'app
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Transaction, Budget } from '../types';
import SecureDatabase from '../services/storage/SecureDatabase';

interface DataContextType {
  transactions: Transaction[];
  budgets: Budget[];
  loading: boolean;
  refreshData: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string | null>;
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string | null>;
  resetDatabase: () => Promise<void>;
  seedDatabase: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Carica tutti i dati dal database
   */
  const loadAllData = useCallback(async () => {
    try {
      await SecureDatabase.initialize();

      const [txs, bdgs] = await Promise.all([
        SecureDatabase.getAllTransactions(),
        SecureDatabase.getAllBudgets()
      ]);

      setTransactions(txs);
      setBudgets(bdgs);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh manuale dei dati
   */
  const refreshData = useCallback(async () => {
    await loadAllData();
  }, [loadAllData]);

  /**
   * Aggiunge una transazione e aggiorna tutti i dati
   */
  const addTransaction = useCallback(async (
    transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string | null> => {
    try {
      if (transaction.amount === 0) {
        throw new Error('Amount cannot be zero');
      }
      if (!transaction.description?.trim()) {
        throw new Error('Description is required');
      }

      const id = await SecureDatabase.insertTransaction(transaction);

      // Ricarica tutti i dati per aggiornare analytics
      await refreshData();

      return id;
    } catch (error) {
      console.error('Error adding transaction:', error);
      return null;
    }
  }, [refreshData]);

  /**
   * Aggiunge un budget e aggiorna tutti i dati
   */
  const addBudget = useCallback(async (
    budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string | null> => {
    try {
      if (budget.limit <= 0) {
        throw new Error('Limit must be positive');
      }
      if (!budget.category?.trim()) {
        throw new Error('Category is required');
      }

      const id = await SecureDatabase.insertBudget(budget);

      // Ricarica tutti i dati
      await refreshData();

      return id;
    } catch (error) {
      console.error('Error adding budget:', error);
      return null;
    }
  }, [refreshData]);

  /**
   * Reset completo del database (solo per sviluppatori)
   */
  const resetDatabase = useCallback(async () => {
    try {
      await SecureDatabase.resetDatabase();
      await refreshData();
      console.log('✅ Database reset completato');
    } catch (error) {
      console.error('Error resetting database:', error);
    }
  }, [refreshData]);

  /**
   * Seed database con dati di esempio (solo per sviluppatori)
   */
  const seedDatabase = useCallback(async () => {
    try {
      await SecureDatabase.initialize();

      // Dati di esempio per transazioni
      const sampleTransactions = [
        // Stipendio
        { amount: 2500, description: 'Stipendio Dicembre', category: 'Salary', date: Date.now() - 5 * 24 * 60 * 60 * 1000, accountId: 'default' },

        // Spese quotidiane
        { amount: -45.50, description: 'Spesa al supermercato', category: 'Food', date: Date.now() - 4 * 24 * 60 * 60 * 1000, accountId: 'default' },
        { amount: -8.90, description: 'Colazione al bar', category: 'Food', date: Date.now() - 3 * 24 * 60 * 60 * 1000, accountId: 'default' },
        { amount: -65.00, description: 'Cena fuori', category: 'Food', date: Date.now() - 2 * 24 * 60 * 60 * 1000, accountId: 'default' },

        // Trasporti
        { amount: -35.00, description: 'Abbonamento metro', category: 'Transport', date: Date.now() - 7 * 24 * 60 * 60 * 1000, accountId: 'default' },
        { amount: -50.00, description: 'Benzina', category: 'Transport', date: Date.now() - 4 * 24 * 60 * 60 * 1000, accountId: 'default' },

        // Shopping
        { amount: -89.99, description: 'Nuove scarpe', category: 'Shopping', date: Date.now() - 6 * 24 * 60 * 60 * 1000, accountId: 'default' },
        { amount: -25.00, description: 'Libro su Amazon', category: 'Shopping', date: Date.now() - 3 * 24 * 60 * 60 * 1000, accountId: 'default' },

        // Bollette
        { amount: -120.00, description: 'Bolletta luce e gas', category: 'Bills', date: Date.now() - 8 * 24 * 60 * 60 * 1000, accountId: 'default' },
        { amount: -29.99, description: 'Netflix', category: 'Entertainment', date: Date.now() - 5 * 24 * 60 * 60 * 1000, accountId: 'default' },
        { amount: -14.99, description: 'Spotify', category: 'Entertainment', date: Date.now() - 5 * 24 * 60 * 60 * 1000, accountId: 'default' },

        // Salute
        { amount: -45.00, description: 'Farmacia', category: 'Health', date: Date.now() - 9 * 24 * 60 * 60 * 1000, accountId: 'default' },

        // Altre entrate
        { amount: 150.00, description: 'Freelance progetto', category: 'Investment', date: Date.now() - 2 * 24 * 60 * 60 * 1000, accountId: 'default' },

        // Mese scorso
        { amount: 2500, description: 'Stipendio Novembre', category: 'Salary', date: Date.now() - 35 * 24 * 60 * 60 * 1000, accountId: 'default' },
        { amount: -450.00, description: 'Affitto', category: 'Bills', date: Date.now() - 30 * 24 * 60 * 60 * 1000, accountId: 'default' },
        { amount: -200.00, description: 'Spesa mensile', category: 'Food', date: Date.now() - 28 * 24 * 60 * 60 * 1000, accountId: 'default' }
      ];

      // Dati di esempio per budget
      const sampleBudgets = [
        { category: 'Food', limit: 400, period: 'monthly' as const, spent: 0, startDate: Date.now(), endDate: Date.now() + 30 * 24 * 60 * 60 * 1000 },
        { category: 'Transport', limit: 150, period: 'monthly' as const, spent: 0, startDate: Date.now(), endDate: Date.now() + 30 * 24 * 60 * 60 * 1000 },
        { category: 'Shopping', limit: 200, period: 'monthly' as const, spent: 0, startDate: Date.now(), endDate: Date.now() + 30 * 24 * 60 * 60 * 1000 },
        { category: 'Entertainment', limit: 100, period: 'monthly' as const, spent: 0, startDate: Date.now(), endDate: Date.now() + 30 * 24 * 60 * 60 * 1000 }
      ];

      // Inserisci transazioni
      for (const tx of sampleTransactions) {
        await SecureDatabase.insertTransaction(tx);
      }

      // Inserisci budget
      for (const budget of sampleBudgets) {
        await SecureDatabase.insertBudget(budget);
      }

      await refreshData();
      console.log('✅ Database seed completato con', sampleTransactions.length, 'transazioni e', sampleBudgets.length, 'budget');
    } catch (error) {
      console.error('Error seeding database:', error);
    }
  }, [refreshData]);

  // Carica dati iniziali
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return (
    <DataContext.Provider
      value={{
        transactions,
        budgets,
        loading,
        refreshData,
        addTransaction,
        addBudget,
        resetDatabase,
        seedDatabase
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

/**
 * Hook per accedere al DataContext
 */
export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};
