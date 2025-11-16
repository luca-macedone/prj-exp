// Core types for the finance app

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: number; // Unix timestamp
  accountId: string;
  merchant?: string;
  notes?: string;
  receiptPath?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'cash';
  balance: number;
  currency: string;
  bankConnectionId?: string;
  lastSync?: number;
  isManual: boolean;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: number;
  endDate?: number;
  spent?: number;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  type: 'income' | 'expense';
}

export interface User {
  id: string;
  emailHash: string;
  createdAt: number;
  lastLogin?: number;
}

export interface BankToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  institutionId: string;
}

export interface EncryptedBackup {
  encryptedData: string;
  salt: string;
  checksum: string;
  timestamp: number;
  platform: string;
}
