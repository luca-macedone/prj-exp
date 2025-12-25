/**
 * ThemeContext - Gestione tema light/dark con NativeWind
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, useColorScheme } from 'react-native';
import { Theme, darkTheme, lightTheme } from '../theme/themes';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  theme: Theme;
  colorScheme: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>('dark');
  const systemColorScheme = useColorScheme();

  // Determina se il tema è dark
  const isDark = mode === 'dark' || (mode === 'system' && systemColorScheme === 'dark');

  // Color scheme per NativeWind
  const colorScheme: 'light' | 'dark' = isDark ? 'dark' : 'light';

  // Seleziona il tema corrente
  const theme = isDark ? darkTheme : lightTheme;

  // Carica preferenza salvata
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const saved = await AsyncStorage.getItem('theme_mode');
      if (saved) {
        setModeState(saved as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const setMode = async (newMode: ThemeMode) => {
    try {
      setModeState(newMode);
      await AsyncStorage.setItem('theme_mode', newMode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ mode, isDark, theme, colorScheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
