/**
 * Personal Finance App - Ultra Minimal Debug Version
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Text style={styles.title}>Finance App</Text>
        <Text style={styles.subtitle}>App funzionante - versione debug</Text>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 20
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center'
  }
});
