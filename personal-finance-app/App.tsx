/**
 * Personal Finance App - Main entry point
 */

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from './src/theme';

// Main Screens
import { HomeScreen } from './src/screens/HomeScreen';
import { TransactionsScreen } from './src/screens/TransactionsScreen';
import { BudgetScreen } from './src/screens/BudgetScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';

// Auth Screens
import {
  WelcomeScreen,
  LoginScreen,
  RegisterScreen,
  UnlockScreen
} from './src/screens/auth';

// Services
import SecureDatabase from './src/services/storage/SecureDatabase';
import AuthService from './src/services/authentication/AuthService';
import { DataProvider } from './src/context/DataContext';
import { DeveloperMenu } from './src/components/DeveloperMenu';
import { ThemeProvider } from './src/context/ThemeContext';

const Tab = createBottomTabNavigator();

type AuthState = 'loading' | 'welcome' | 'login' | 'register' | 'unlock' | 'authenticated';

export default function App() {
  const [authState, setAuthState] = useState<AuthState>('loading');

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
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

  const handleAuthSuccess = () => {
    setAuthState('authenticated');
  };

  // Loading state
  if (authState === 'loading') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Authentication flow
  if (authState !== 'authenticated') {
    return (
      <SafeAreaProvider>
        {authState === 'welcome' && (
          <WelcomeScreen
            onLogin={() => setAuthState('login')}
            onRegister={() => setAuthState('register')}
          />
        )}
        {authState === 'login' && (
          <LoginScreen
            onSuccess={handleAuthSuccess}
            onBack={() => setAuthState('welcome')}
          />
        )}
        {authState === 'register' && (
          <RegisterScreen
            onSuccess={handleAuthSuccess}
            onBack={() => setAuthState('welcome')}
          />
        )}
        {authState === 'unlock' && (
          <UnlockScreen onSuccess={handleAuthSuccess} />
        )}
      </SafeAreaProvider>
    );
  }

  // Main app (authenticated)
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <DataProvider>
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.text.tertiary,
                tabBarStyle: {
                  backgroundColor: colors.background.secondary,
                  borderTopColor: colors.border,
                  borderTopWidth: 0.5,
                  paddingBottom: 8,
                  paddingTop: 8,
                  height: 70,
                  ...colors.shadow.sm
                },
                tabBarLabelStyle: {
                  fontSize: 11,
                  fontWeight: '600'
                }
              }}
            >
              <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                  tabBarLabel: 'Home',
                  tabBarIcon: ({ color, size }) => (
                    <Ionicons name="home" size={size} color={color} />
                  )
                }}
              />
              <Tab.Screen
                name="Transactions"
                component={TransactionsScreen}
                options={{
                  tabBarLabel: 'Transazioni',
                  tabBarIcon: ({ color, size }) => (
                    <Ionicons name="list" size={size} color={color} />
                  )
                }}
              />
              <Tab.Screen
                name="Budget"
                component={BudgetScreen}
                options={{
                  tabBarLabel: 'Budget',
                  tabBarIcon: ({ color, size }) => (
                    <Ionicons name="wallet" size={size} color={color} />
                  )
                }}
              />
              <Tab.Screen
                name="Analytics"
                component={AnalyticsScreen}
                options={{
                  tabBarLabel: 'Statistiche',
                  tabBarIcon: ({ color, size }) => (
                    <Ionicons name="bar-chart" size={size} color={color} />
                  )
                }}
              />
            </Tab.Navigator>
          </NavigationContainer>
          <DeveloperMenu />
        </DataProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary
  }
});
