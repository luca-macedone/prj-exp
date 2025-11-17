/**
 * Personal Finance App - Main Entry Point
 * Architettura local-first con privacy massima
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  Alert,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AuthService from './src/services/authentication/AuthService';
import SecureDatabase from './src/services/storage/SecureDatabase';

// Screens
import { TransactionsScreen } from './src/screens/TransactionsScreen';
import { BudgetScreen } from './src/screens/BudgetScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const registered = await AuthService.isUserRegistered();
      setIsRegistered(registered);

      if (registered) {
        const hasSession = await AuthService.hasActiveSession();
        setIsAuthenticated(hasSession);

        // Inizializza database e categorie
        if (hasSession) {
          await SecureDatabase.initialize();
          await SecureDatabase.initializeDefaultCategories();
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      const result = await AuthService.registerUser(
        'demo@financeapp.com',
        'SecurePassword123!'
      );

      if (result.success) {
        // Setup PIN opzionale
        await AuthService.setPIN('1234');

        setIsRegistered(true);
        setIsAuthenticated(true);

        // Inizializza database
        await SecureDatabase.initialize();
        await SecureDatabase.initializeDefaultCategories();

        Alert.alert(
          'Benvenuto! 🎉',
          'Account creato con successo!\n\nDemo PIN: 1234\n\nI tuoi dati sono cifrati e salvati solo sul dispositivo.'
        );
      } else {
        Alert.alert('Errore', result.error || 'Registrazione fallita');
      }
    } catch (error) {
      Alert.alert('Errore', 'Errore durante la registrazione');
    }
  };

  const handleBiometricUnlock = async () => {
    try {
      const result = await AuthService.unlockWithBiometrics();

      if (result.success) {
        setIsAuthenticated(true);
        await SecureDatabase.initialize();
      } else {
        // Fallback su PIN
        Alert.prompt(
          'Inserisci PIN',
          'Biometria non disponibile. Usa il PIN (demo: 1234)',
          [
            {
              text: 'Annulla',
              style: 'cancel'
            },
            {
              text: 'OK',
              onPress: async (pin) => {
                if (pin) {
                  const pinResult = await AuthService.verifyPIN(pin);
                  if (pinResult.success) {
                    setIsAuthenticated(true);
                    await SecureDatabase.initialize();
                  } else {
                    Alert.alert('Errore', 'PIN errato');
                  }
                }
              }
            }
          ],
          'secure-text'
        );
      }
    } catch (error) {
      Alert.alert('Errore', 'Errore durante autenticazione');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Caricamento...</Text>
      </View>
    );
  }

  // Not registered - Registration screen
  if (!isRegistered) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.authContainer}>
          <Text style={styles.logo}>💰</Text>
          <Text style={styles.title}>Finance App</Text>
          <Text style={styles.subtitle}>Privacy-First Financial Management</Text>

          <View style={styles.featureList}>
            <FeatureItem icon="🔒" text="Tutti i dati sul tuo dispositivo" />
            <FeatureItem icon="🔐" text="Encryption hardware-backed" />
            <FeatureItem icon="📱" text="Funziona 100% offline" />
            <FeatureItem icon="🚀" text="Zero dati nel cloud" />
            <FeatureItem icon="📊" text="Budget e analytics completi" />
            <FeatureItem icon="🎨" text="Grafici e report dettagliati" />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Inizia Ora"
              onPress={handleRegister}
              color="#007AFF"
            />
          </View>

          <Text style={styles.disclaimer}>
            I tuoi dati finanziari restano sul tuo dispositivo.{'\n'}
            Nessun dato sensibile viene mai inviato al server.{'\n'}
            {'\n'}
            🔐 Conformità GDPR, OWASP MASVS, PSD2
          </Text>
        </View>
      </View>
    );
  }

  // Registered but not authenticated - Unlock screen
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.authContainer}>
          <Text style={styles.logo}>🔐</Text>
          <Text style={styles.title}>Sblocca App</Text>
          <Text style={styles.subtitle}>
            Usa biometria o PIN per accedere
          </Text>

          <View style={styles.buttonContainer}>
            <Button
              title="Sblocca con Biometria"
              onPress={handleBiometricUnlock}
              color="#007AFF"
            />
          </View>

          <Text style={styles.hintText}>
            PIN demo: 1234
          </Text>
        </View>
      </View>
    );
  }

  // Authenticated - Main app with navigation
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          lazy: false,
          animationEnabled: true,
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
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 24 }}>💳</Text>
            )
          }}
        />
        <Tab.Screen
          name="Budget"
          component={BudgetScreen}
          options={{
            tabBarLabel: 'Budget',
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 24 }}>🎯</Text>
            )
          }}
        />
        <Tab.Screen
          name="Analytics"
          component={AnalyticsScreen}
          options={{
            tabBarLabel: 'Analytics',
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 24 }}>📊</Text>
            )
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const FeatureItem: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#7F8C8D'
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  logo: {
    fontSize: 80,
    marginBottom: 20
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 40,
    textAlign: 'center'
  },
  featureList: {
    width: '100%',
    marginBottom: 40
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
    width: 32
  },
  featureText: {
    fontSize: 16,
    color: '#34495E',
    flex: 1
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 24
  },
  disclaimer: {
    fontSize: 12,
    color: '#95A5A6',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20
  },
  hintText: {
    fontSize: 14,
    color: '#95A5A6',
    marginTop: 16,
    textAlign: 'center'
  }
});
