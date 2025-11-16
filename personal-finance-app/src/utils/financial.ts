/**
 * Financial Utilities
 * Calcoli finanziari precisi usando big.js per evitare errori floating-point
 */

import Big from 'big.js';

/**
 * Somma precisione decimale
 */
export const add = (...amounts: number[]): number => {
  return amounts.reduce((sum, amount) => {
    return sum.plus(new Big(amount));
  }, new Big(0)).toNumber();
};

/**
 * Sottrazione precisione decimale
 */
export const subtract = (a: number, b: number): number => {
  return new Big(a).minus(new Big(b)).toNumber();
};

/**
 * Moltiplicazione precisione decimale
 */
export const multiply = (a: number, b: number): number => {
  return new Big(a).times(new Big(b)).toNumber();
};

/**
 * Divisione precisione decimale
 */
export const divide = (a: number, b: number): number => {
  if (b === 0) throw new Error('Division by zero');
  return new Big(a).div(new Big(b)).toNumber();
};

/**
 * Calcola percentuale
 */
export const percentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return new Big(value).div(new Big(total)).times(100).toNumber();
};

/**
 * Arrotonda a 2 decimali (per valute)
 */
export const roundCurrency = (amount: number): number => {
  return new Big(amount).round(2).toNumber();
};

/**
 * Formatta importo come valuta EUR
 */
export const formatCurrency = (amount: number, decimals = 2): string => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount);
};

/**
 * Formatta numero con separatori migliaia
 */
export const formatNumber = (value: number, decimals = 0): string => {
  return new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * Calcola media array di numeri
 */
export const average = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, n) => acc.plus(new Big(n)), new Big(0));
  return sum.div(numbers.length).toNumber();
};

/**
 * Trova minimo in array
 */
export const min = (numbers: number[]): number => {
  if (numbers.length === 0) throw new Error('Empty array');
  return Math.min(...numbers);
};

/**
 * Trova massimo in array
 */
export const max = (numbers: number[]): number => {
  if (numbers.length === 0) throw new Error('Empty array');
  return Math.max(...numbers);
};

/**
 * Valida se un importo è valido
 */
export const isValidAmount = (amount: number): boolean => {
  return !isNaN(amount) && isFinite(amount);
};

/**
 * Converte stringa in numero sicuro per calcoli
 */
export const parseAmount = (value: string): number | null => {
  try {
    // Rimuove spazi e sostituisce virgola con punto
    const cleaned = value.trim().replace(/,/g, '.');

    // Rimuove simboli valuta
    const numeric = cleaned.replace(/[€$£¥]/g, '');

    const amount = parseFloat(numeric);

    if (isValidAmount(amount)) {
      return new Big(amount).toNumber();
    }

    return null;
  } catch {
    return null;
  }
};
