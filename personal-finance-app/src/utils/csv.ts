/**
 * CSV Import/Export Utilities
 * Gestione sicura di file CSV con validazione e sanitizzazione
 */

import Papa from 'papaparse';
import { Transaction } from '../types';
import { parseAmount } from './financial';

interface CSVTransaction {
  date: string;
  description: string;
  amount: string;
  category: string;
  merchant?: string;
  notes?: string;
}

interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
  transactions: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[];
}

/**
 * Importa transazioni da file CSV
 */
export const importTransactionsFromCSV = (
  csvContent: string,
  accountId: string
): ImportResult => {
  const result: ImportResult = {
    success: false,
    imported: 0,
    failed: 0,
    errors: [],
    transactions: []
  };

  try {
    // Parse CSV con PapaParse
    const parsed = Papa.parse<CSVTransaction>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase()
    });

    if (parsed.errors.length > 0) {
      result.errors.push('CSV parsing errors detected');
      parsed.errors.forEach(err => {
        result.errors.push(`Row ${err.row}: ${err.message}`);
      });
    }

    // Valida e processa ogni riga
    parsed.data.forEach((row, index) => {
      try {
        const transaction = validateAndParseRow(row, accountId, index + 1);

        if (transaction) {
          result.transactions.push(transaction);
          result.imported++;
        } else {
          result.failed++;
        }
      } catch (error) {
        result.failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`Row ${index + 1}: ${errorMessage}`);
      }
    });

    result.success = result.imported > 0 && result.failed === 0;
  } catch (error) {
    result.errors.push('Failed to parse CSV file');
    console.error('CSV import error:', error);
  }

  return result;
};

/**
 * Valida e parse una riga CSV
 */
const validateAndParseRow = (
  row: CSVTransaction,
  accountId: string,
  rowNumber: number
): Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> | null => {
  // Sanitizza tutti i campi per prevenire CSV injection
  const sanitizedRow = {
    date: sanitizeCSVField(row.date),
    description: sanitizeCSVField(row.description),
    amount: sanitizeCSVField(row.amount),
    category: sanitizeCSVField(row.category),
    merchant: row.merchant ? sanitizeCSVField(row.merchant) : undefined,
    notes: row.notes ? sanitizeCSVField(row.notes) : undefined
  };

  // Valida campi obbligatori
  if (!sanitizedRow.date || !sanitizedRow.description || !sanitizedRow.amount || !sanitizedRow.category) {
    throw new Error('Missing required fields (date, description, amount, category)');
  }

  // Parse date
  const date = parseDate(sanitizedRow.date);
  if (!date) {
    throw new Error(`Invalid date format: ${sanitizedRow.date}`);
  }

  // Parse amount
  const amount = parseAmount(sanitizedRow.amount);
  if (amount === null) {
    throw new Error(`Invalid amount: ${sanitizedRow.amount}`);
  }

  // Valida description
  if (sanitizedRow.description.length < 2 || sanitizedRow.description.length > 200) {
    throw new Error('Description must be between 2 and 200 characters');
  }

  // Valida category
  if (sanitizedRow.category.length < 2 || sanitizedRow.category.length > 50) {
    throw new Error('Category must be between 2 and 50 characters');
  }

  return {
    date,
    description: sanitizedRow.description,
    amount,
    category: sanitizedRow.category,
    accountId,
    merchant: sanitizedRow.merchant,
    notes: sanitizedRow.notes
  };
};

/**
 * Sanitizza campo CSV per prevenire injection attacks
 * Previene formule Excel/Calc che iniziano con =, +, -, @, \t
 */
export const sanitizeCSVField = (field: string): string => {
  if (!field) return '';

  let sanitized = field.toString().trim();

  // Rimuove caratteri pericolosi all'inizio
  sanitized = sanitized.replace(/^[=+\-@\t\r\n]/g, '');

  // Rimuove caratteri di controllo
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

  // Limita lunghezza
  sanitized = sanitized.substring(0, 500);

  return sanitized;
};

/**
 * Parse data da vari formati
 */
const parseDate = (dateString: string): number | null => {
  // Formati supportati: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY
  try {
    // Prova ISO format prima
    const isoDate = new Date(dateString);
    if (!isNaN(isoDate.getTime())) {
      return isoDate.getTime();
    }

    // Prova formato italiano DD/MM/YYYY o DD-MM-YYYY
    const parts = dateString.split(/[/-]/);
    if (parts.length === 3) {
      const [day, month, year] = parts.map(p => parseInt(p, 10));

      if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900) {
        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) {
          return date.getTime();
        }
      }
    }

    return null;
  } catch {
    return null;
  }
};

/**
 * Esporta transazioni in formato CSV
 */
export const exportTransactionsToCSV = (transactions: Transaction[]): string => {
  // Header
  const headers = ['Date', 'Description', 'Amount', 'Category', 'Merchant', 'Notes'];

  // Righe dati
  const rows = transactions.map(t => {
    const date = new Date(t.date).toISOString().split('T')[0];
    const amount = t.amount.toFixed(2);

    return [
      wrapCSVField(date),
      wrapCSVField(t.description),
      amount,
      wrapCSVField(t.category),
      wrapCSVField(t.merchant || ''),
      wrapCSVField(t.notes || '')
    ];
  });

  // Combina header e righe
  const csvLines = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ];

  return csvLines.join('\n');
};

/**
 * Wrappa campo CSV con doppi apici e escape
 */
const wrapCSVField = (field: string): string => {
  if (!field) return '""';

  // Sanitizza
  const sanitized = sanitizeCSVField(field);

  // Escape doppi apici
  const escaped = sanitized.replace(/"/g, '""');

  // Wrappa con doppi apici
  return `"${escaped}"`;
};

/**
 * Genera CSV template per import
 */
export const generateCSVTemplate = (): string => {
  const headers = ['Date', 'Description', 'Amount', 'Category', 'Merchant', 'Notes'];
  const exampleRow = [
    '2024-01-15',
    'Grocery Shopping',
    '-45.50',
    'Food',
    'SuperMarket',
    'Weekly groceries'
  ];

  return [
    headers.join(','),
    exampleRow.join(',')
  ].join('\n');
};
