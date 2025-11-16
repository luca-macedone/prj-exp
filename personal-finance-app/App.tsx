/**
 * Personal Finance App - Main Entry Point
 * Demo dell'architettura local-first con privacy massima
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Button,
  Alert,
  StatusBar
} from 'react-native';
import { TransactionList } from './src/features/transactions';
import { useTransactions } from './src/features/transactions/hooks/useTransactions';
import AuthService from './src/services/authentication/AuthService';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);

  const {
    transactions,
    loading: transactionsLoading,
    error,
    addTransaction,
    refreshTransactions
  } = useTransactions();

  // Check auth status on mount
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
        'demo@example.com',
        'SecurePassword123!'
      );

      if (result.success) {
        setIsRegistered(true);
        setIsAuthenticated(true);
        Alert.alert('Successo', 'Account creato con successo!');
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
        Alert.alert('Successo', 'Autenticazione riuscita!');
      } else {
        Alert.alert('Errore', result.error || 'Autenticazione fallita');
      }
    } catch (error) {
      Alert.alert('Errore', 'Errore durante autenticazione');
    }
  };

  const handleAddSampleTransaction = async () => {
    try {
      const result = await addTransaction({
        amount: -25.50,
        description: 'Grocery Shopping',
        category: 'Food',
        date: Date.now(),
        accountId: 'default-account',
        merchant: 'SuperMercato Italia'
      });

      if (result) {
        Alert.alert('Successo', 'Transazione aggiunta!');
      } else {
        Alert.alert('Errore', error || 'Impossibile aggiungere transazione');
      }
    } catch (err) {
      Alert.alert('Errore', 'Errore durante aggiunta transazione');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Caricamento...</Text>
      </SafeAreaView>
    );
  }

  // Not registered - show registration
  if (!isRegistered) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.authContainer}>
          <Text style={styles.title}>💰 Finance App</Text>
          <Text style={styles.subtitle}>Privacy-First Financial Management</Text>

          <View style={styles.featureList}>
            <Text style={styles.feature}>🔒 Tutti i dati sul tuo dispositivo</Text>
            <Text style={styles.feature}>🔐 Encryption hardware-backed</Text>
            <Text style={styles.feature}>📱 Funziona offline al 100%</Text>
            <Text style={styles.feature}>🚀 Zero dati nel cloud</Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button title="Crea Account" onPress={handleRegister} />
          </View>

          <Text style={styles.disclaimer}>
            I tuoi dati finanziari restano sul tuo dispositivo.{'\n'}
            Nessun dato sensibile viene mai inviato al server.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Registered but not authenticated - show unlock
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.authContainer}>
          <Text style={styles.title}>🔐 Sblocca App</Text>
          <Text style={styles.subtitle}>Usa biometria per accedere</Text>

          <View style={styles.buttonContainer}>
            <Button title="Sblocca con Biometria" onPress={handleBiometricUnlock} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Authenticated - show main app
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Le Mie Transazioni</Text>
        <Text style={styles.headerSubtitle}>
          {transactions.length} transazioni • Privacy garantita
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <Button
          title="+ Aggiungi Transazione"
          onPress={handleAddSampleTransaction}
        />
      </View>

      {/* Transactions List */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <TransactionList
        transactions={transactions}
        loading={transactionsLoading}
        onRefresh={refreshTransactions}
        onTransactionPress={(transaction) => {
          Alert.alert(
            'Dettagli Transazione',
            `${transaction.description}\n${transaction.amount}€\n${transaction.category}`
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA'
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 32,
    textAlign: 'center'
  },
  featureList: {
    marginBottom: 32,
    alignItems: 'flex-start'
  },
  feature: {
    fontSize: 16,
    color: '#34495E',
    marginBottom: 12,
    textAlign: 'left'
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 24
  },
  disclaimer: {
    fontSize: 12,
    color: '#95A5A6',
    textAlign: 'center',
    lineHeight: 18
  },
  loadingText: {
    fontSize: 18,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 50
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7F8C8D'
  },
  actionsContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8'
  },
  errorContainer: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFC107'
  },
  errorText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center'
  }
});
