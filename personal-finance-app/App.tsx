/**
 * Personal Finance App - Testing Navigation
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

// Dummy screens per test
function TransactionsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.screenTitle}>💳 Transazioni</Text>
      <Text style={styles.screenText}>Schermata funzionante</Text>
    </View>
  );
}

function BudgetScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.screenTitle}>🎯 Budget</Text>
      <Text style={styles.screenText}>Schermata funzionante</Text>
    </View>
  );
}

function AnalyticsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.screenTitle}>📊 Analytics</Text>
      <Text style={styles.screenText}>Schermata funzionante</Text>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: '#8E8E93'
          }}
        >
          <Tab.Screen
            name="Transactions"
            component={TransactionsScreen}
            options={{
              tabBarLabel: 'Transazioni',
              tabBarIcon: () => <Text style={styles.icon}>💳</Text>
            }}
          />
          <Tab.Screen
            name="Budget"
            component={BudgetScreen}
            options={{
              tabBarLabel: 'Budget',
              tabBarIcon: () => <Text style={styles.icon}>🎯</Text>
            }}
          />
          <Tab.Screen
            name="Analytics"
            component={AnalyticsScreen}
            options={{
              tabBarLabel: 'Analytics',
              tabBarIcon: () => <Text style={styles.icon}>📊</Text>
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 20
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12
  },
  screenText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center'
  },
  icon: {
    fontSize: 24
  }
});
