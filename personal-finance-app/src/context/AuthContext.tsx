/**
 * AuthContext - Manages authentication state across the app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import SecureDatabase from '../services/storage/SecureDatabase';
import AuthService from '../services/authentication/AuthService';

type AuthState = 'loading' | 'welcome' | 'login' | 'register' | 'unlock' | 'authenticated';

interface AuthContextType {
  authState: AuthState;
  setAuthState: (state: AuthState) => void;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>('loading');

  const initializeAuth = async () => {
    try {
      // Initialize database
      await SecureDatabase.initialize();

      // Check if user is registered
      const isRegistered = await AuthService.isUserRegistered();

      if (isRegistered) {
        // User exists, show unlock screen
        setAuthState('unlock');
      } else {
        // New user, show welcome screen
        setAuthState('welcome');
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
      setAuthState('welcome'); // Fallback to welcome
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      setAuthState('welcome');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ authState, setAuthState, logout, initializeAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
