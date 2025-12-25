/**
 * Personal Finance App - Main entry point
 */

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
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
import { DataProvider } from './src/context/DataContext';
import { DeveloperMenu } from './src/components/DeveloperMenu';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';

const Tab = createBottomTabNavigator();

const AppContent: React.FC = () => {
  const { authState, setAuthState } = useAuth();

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
      <>
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
          <UnlockScreen
            onSuccess={handleAuthSuccess}
            onChangeUser={() => setAuthState('welcome')}
          />
        )}
      </>
    );
  }

  // Main app (authenticated)
  return (
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
  );
};

export default function App() {
  return (
    <>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
      <Toast />
    </>
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
