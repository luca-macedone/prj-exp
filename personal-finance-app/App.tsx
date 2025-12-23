/**
 * Personal Finance App - Simplified Entry Point
 * Versione semplificata per debug - bypassa autenticazione
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SecureDatabase from './src/services/storage/SecureDatabase';

// Screens
import { TransactionsScreen } from './src/screens/TransactionsScreen';
import { BudgetScreen } from './src/screens/BudgetScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Inizializza database
      await SecureDatabase.initialize();
      await SecureDatabase.initializeDefaultCategories();

      setLoading(false);
    } catch (err) {
      console.error('Initialization error:', err);
      setError(err instanceof Error ? err.message : 'Initialization failed');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Inizializzazione...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>⚠️ Errore</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Main app
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: '#8E8E93',
            tabBarStyle: {
              backgroundColor: '#FFFFFF',
              borderTopWidth: 1,
              borderTopColor: '#E8E8E8',
              height: 60,
              paddingBottom: 8,
              paddingTop: 8
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600'
            }
          }}
        >
          <Tab.Screen
            name="Transactions"
            component={TransactionsScreen}
            options={{
              tabBarLabel: 'Transazioni',
              tabBarIcon: () => (
                <Text style={{ fontSize: 24 }}>💳</Text>
              )
            }}
          />
          <Tab.Screen
            name="Budget"
            component={BudgetScreen}
            options={{
              tabBarLabel: 'Budget',
              tabBarIcon: () => (
                <Text style={{ fontSize: 24 }}>🎯</Text>
              )
            }}
          />
          <Tab.Screen
            name="Analytics"
            component={AnalyticsScreen}
            options={{
              tabBarLabel: 'Analytics',
              tabBarIcon: () => (
                <Text style={{ fontSize: 24 }}>📊</Text>
              )
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 20
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#7F8C8D'
  },
  errorTitle: {
    fontSize: 24,
    marginBottom: 12,
    color: '#E74C3C'
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  }
});
