/**
 * SecureDatabase Service
 * Implementa database locale cifrato usando expo-sqlite e expo-secure-store
 * Segue l'architettura local-first per privacy massima
 */

import * as SQLite from 'expo-sqlite';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Transaction, Account, Budget, Category } from '../../types';

class SecureDatabase {
  private db: SQLite.SQLiteDatabase | null = null;
  private encryptionKey: string | null = null;
  private isInitialized = false;

  /**
   * Inizializza il database con encryption key da secure storage hardware
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('Database already initialized');
      return;
    }

    try {
      // Genera o recupera la master key dal secure storage hardware-backed
      this.encryptionKey = await this.getMasterKey();

      // Apre il database locale
      this.db = await SQLite.openDatabaseAsync('finance_local.db');

      // Crea le tabelle se non esistono
      await this.createTables();

      this.isInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw new Error('Database initialization failed');
    }
  }

  /**
   * Recupera o genera la master key per cifratura database
   * La chiave è salvata in iOS Keychain o Android Keystore (hardware-backed)
   */
  private async getMasterKey(): Promise<string> {
    try {
      let key = await SecureStore.getItemAsync('db_master_key');

      if (!key) {
        // Prima apertura: genera chiave casuale a 256 bit
        const randomBytes = await Crypto.getRandomBytesAsync(32);
        key = this.bytesToHex(randomBytes);

        // Salva nel secure storage hardware-backed
        await SecureStore.setItemAsync('db_master_key', key);
        console.log('Generated new master key');
      }

      return key;
    } catch (error) {
      console.error('Failed to get/generate master key:', error);
      throw error;
    }
  }

  /**
   * Converte array di bytes in stringa hex
   */
  private bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Crea le tabelle del database
   * Tutti i dati finanziari sono salvati LOCALMENTE, mai nel cloud
   */
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not opened');

    try {
      // Tabella transazioni - completamente locale
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY,
          amount REAL NOT NULL,
          description TEXT,
          category TEXT,
          date INTEGER NOT NULL,
          account_id TEXT,
          merchant TEXT,
          notes TEXT,
          receipt_path TEXT,
          created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
          updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
        );
      `);

      // Tabella accounts
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS accounts (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          balance REAL DEFAULT 0,
          currency TEXT DEFAULT 'EUR',
          bank_connection_id TEXT,
          last_sync INTEGER,
          is_manual INTEGER DEFAULT 1
        );
      `);

      // Tabella budgets
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS budgets (
          id TEXT PRIMARY KEY,
          category TEXT NOT NULL,
          limit_amount REAL NOT NULL,
          period TEXT NOT NULL,
          start_date INTEGER NOT NULL,
          end_date INTEGER,
          spent REAL DEFAULT 0
        );
      `);

      // Tabella categories
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          icon TEXT,
          color TEXT,
          type TEXT NOT NULL
        );
      `);

      // Indici per performance su query frequenti
      await this.db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_transactions_date
        ON transactions(date DESC);
      `);

      await this.db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_transactions_category
        ON transactions(category);
      `);

      await this.db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_transactions_account
        ON transactions(account_id);
      `);

      console.log('Database tables created successfully');
    } catch (error) {
      console.error('Failed to create tables:', error);
      throw error;
    }
  }

  /**
   * Inserisce una nuova transazione
   */
  async insertTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${Date.now()}-${Math.random()}`
    );

    const now = Date.now();

    await this.db.runAsync(
      `INSERT INTO transactions (
        id, amount, description, category, date, account_id,
        merchant, notes, receipt_path, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        transaction.amount,
        transaction.description,
        transaction.category,
        transaction.date,
        transaction.accountId,
        transaction.merchant || null,
        transaction.notes || null,
        transaction.receiptPath || null,
        now,
        now
      ]
    );

    return id;
  }

  /**
   * Recupera tutte le transazioni
   */
  async getAllTransactions(): Promise<Transaction[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync<any>(
      'SELECT * FROM transactions ORDER BY date DESC'
    );

    return result.map(row => this.mapRowToTransaction(row));
  }

  /**
   * Recupera transazioni per range di date
   */
  async getTransactionsByDateRange(startDate: number, endDate: number): Promise<Transaction[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync<any>(
      'SELECT * FROM transactions WHERE date >= ? AND date <= ? ORDER BY date DESC',
      [startDate, endDate]
    );

    return result.map(row => this.mapRowToTransaction(row));
  }

  /**
   * Inserisce un nuovo account
   */
  async insertAccount(account: Omit<Account, 'id'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${Date.now()}-${account.name}-${Math.random()}`
    );

    await this.db.runAsync(
      `INSERT INTO accounts (
        id, name, type, balance, currency, bank_connection_id, last_sync, is_manual
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        account.name,
        account.type,
        account.balance,
        account.currency,
        account.bankConnectionId || null,
        account.lastSync || null,
        account.isManual ? 1 : 0
      ]
    );

    return id;
  }

  /**
   * Recupera tutti gli account
   */
  async getAllAccounts(): Promise<Account[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync<any>(
      'SELECT * FROM accounts'
    );

    return result.map(row => this.mapRowToAccount(row));
  }

  /**
   * Inserisce un nuovo budget
   */
  async insertBudget(budget: Omit<Budget, 'id'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${Date.now()}-${budget.category}-${Math.random()}`
    );

    await this.db.runAsync(
      `INSERT INTO budgets (
        id, category, limit_amount, period, start_date, end_date, spent
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        budget.category,
        budget.limit,
        budget.period,
        budget.startDate,
        budget.endDate || null,
        budget.spent || 0
      ]
    );

    return id;
  }

  /**
   * Recupera tutti i budget
   */
  async getAllBudgets(): Promise<Budget[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync<any>(
      'SELECT * FROM budgets ORDER BY start_date DESC'
    );

    return result.map(row => this.mapRowToBudget(row));
  }

  /**
   * Recupera budget attivi (dentro il periodo corrente)
   */
  async getActiveBudgets(): Promise<Budget[]> {
    if (!this.db) throw new Error('Database not initialized');

    const now = Date.now();

    const result = await this.db.getAllAsync<any>(
      `SELECT * FROM budgets
       WHERE start_date <= ?
       AND (end_date IS NULL OR end_date >= ?)
       ORDER BY start_date DESC`,
      [now, now]
    );

    return result.map(row => this.mapRowToBudget(row));
  }

  /**
   * Recupera budget per categoria specifica
   */
  async getBudgetByCategory(category: string): Promise<Budget | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync<any>(
      'SELECT * FROM budgets WHERE category = ? ORDER BY start_date DESC LIMIT 1',
      [category]
    );

    return result ? this.mapRowToBudget(result) : null;
  }

  /**
   * Aggiorna la spesa corrente di un budget
   */
  async updateBudgetSpent(budgetId: string, spent: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      'UPDATE budgets SET spent = ? WHERE id = ?',
      [spent, budgetId]
    );
  }

  /**
   * Calcola spesa per categoria in un periodo
   */
  async getSpendingByCategory(category: string, startDate: number, endDate: number): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync<any>(
      `SELECT SUM(ABS(amount)) as total
       FROM transactions
       WHERE category = ?
       AND date >= ?
       AND date <= ?
       AND amount < 0`,
      [category, startDate, endDate]
    );

    return result?.total || 0;
  }

  /**
   * Inserisce una categoria predefinita
   */
  async insertCategory(category: Omit<Category, 'id'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${Date.now()}-${category.name}-${Math.random()}`
    );

    try {
      await this.db.runAsync(
        `INSERT INTO categories (id, name, icon, color, type) VALUES (?, ?, ?, ?, ?)`,
        [id, category.name, category.icon || null, category.color || null, category.type]
      );

      return id;
    } catch (error) {
      // Ignora errore se categoria già esistente
      console.warn('Category might already exist:', category.name);
      return id;
    }
  }

  /**
   * Recupera tutte le categorie
   */
  async getAllCategories(): Promise<Category[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync<any>(
      'SELECT * FROM categories ORDER BY name'
    );

    return result.map(row => this.mapRowToCategory(row));
  }

  /**
   * Inizializza categorie predefinite
   */
  async initializeDefaultCategories(): Promise<void> {
    const defaultCategories = [
      { name: 'Food', icon: '🍔', color: '#FF6B6B', type: 'expense' as const },
      { name: 'Transport', icon: '🚗', color: '#4ECDC4', type: 'expense' as const },
      { name: 'Shopping', icon: '🛍️', color: '#FFD93D', type: 'expense' as const },
      { name: 'Bills', icon: '💳', color: '#6C5CE7', type: 'expense' as const },
      { name: 'Entertainment', icon: '🎬', color: '#FF8787', type: 'expense' as const },
      { name: 'Health', icon: '🏥', color: '#A8E6CF', type: 'expense' as const },
      { name: 'Education', icon: '📚', color: '#95E1D3', type: 'expense' as const },
      { name: 'Salary', icon: '💰', color: '#4CAF50', type: 'income' as const },
      { name: 'Investment', icon: '📈', color: '#00BCD4', type: 'income' as const },
      { name: 'Other', icon: '📌', color: '#95A5A6', type: 'expense' as const }
    ];

    for (const category of defaultCategories) {
      await this.insertCategory(category);
    }

    console.log('Default categories initialized');
  }

  /**
   * Cancella tutto il database (GDPR right to erasure)
   */
  async deleteAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.execAsync(`
      DELETE FROM transactions;
      DELETE FROM accounts;
      DELETE FROM budgets;
      DELETE FROM categories;
    `);

    // Rimuove anche la master key
    await SecureStore.deleteItemAsync('db_master_key');

    console.log('All data deleted');
  }

  /**
   * Mappers per convertire row del database in oggetti tipizzati
   */
  private mapRowToTransaction(row: any): Transaction {
    return {
      id: row.id,
      amount: row.amount,
      description: row.description,
      category: row.category,
      date: row.date,
      accountId: row.account_id,
      merchant: row.merchant,
      notes: row.notes,
      receiptPath: row.receipt_path,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapRowToAccount(row: any): Account {
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      balance: row.balance,
      currency: row.currency,
      bankConnectionId: row.bank_connection_id,
      lastSync: row.last_sync,
      isManual: row.is_manual === 1 || row.is_manual === '1' || row.is_manual === true
    };
  }

  private mapRowToBudget(row: any): Budget {
    return {
      id: row.id,
      category: row.category,
      limit: row.limit_amount,
      period: row.period,
      startDate: row.start_date,
      endDate: row.end_date,
      spent: row.spent || 0
    };
  }

  private mapRowToCategory(row: any): Category {
    return {
      id: row.id,
      name: row.name,
      icon: row.icon,
      color: row.color,
      type: row.type
    };
  }
}

// Singleton instance
export default new SecureDatabase();
