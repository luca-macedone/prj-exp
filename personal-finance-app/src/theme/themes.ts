/**
 * Light and Dark Theme Definitions
 */

export interface Theme {
  colors: {
    primary: string;
    background: {
      primary: string;
      secondary: string;
      card: string;
    };
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    categories: {
      [key: string]: string;
    };
    shadow: {
      sm: any;
      md: any;
      lg: any;
    };
  };
  spacing: typeof import('./index').spacing;
  borderRadius: typeof import('./index').borderRadius;
  typography: typeof import('./index').typography;
}

import { spacing, borderRadius, typography } from './index';

const categoryColors = {
  Food: '#FF6B6B',
  Transport: '#4ECDC4',
  Shopping: '#FFD93D',
  Bills: '#6C5CE7',
  Entertainment: '#FF8787',
  Health: '#A8E6CF',
  Education: '#95E1D3',
  Salary: '#4CAF50',
  Investment: '#00BCD4',
  Other: '#95A5A6'
};

export const darkTheme: Theme = {
  colors: {
    primary: '#007AFF',
    background: {
      primary: '#0A1628',
      secondary: '#152039',
      card: '#1E2D47',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#A0AEC0',
      tertiary: '#718096',
    },
    border: '#2D3748',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    categories: categoryColors,
    shadow: {
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
      },
    },
  },
  spacing,
  borderRadius,
  typography,
};

export const lightTheme: Theme = {
  colors: {
    primary: '#007AFF',
    background: {
      primary: '#FFFFFF',
      secondary: '#F7FAFC',
      card: '#FFFFFF',
    },
    text: {
      primary: '#1A202C',
      secondary: '#4A5568',
      tertiary: '#718096',
    },
    border: '#E2E8F0',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    categories: categoryColors,
    shadow: {
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1.0,
        elevation: 1,
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 2.62,
        elevation: 2,
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 4.65,
        elevation: 4,
      },
    },
  },
  spacing,
  borderRadius,
  typography,
};
