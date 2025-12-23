/**
 * Personal Finance App - Testing useState
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('Funziona!');

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Text style={styles.title}>Finance App - Test useState</Text>
        <Text style={styles.subtitle}>{text}</Text>
        <Text style={styles.count}>Contatore: {count}</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setCount(count + 1)}
        >
          <Text style={styles.buttonText}>Incrementa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setText('useState funziona!')}
        >
          <Text style={styles.buttonText}>Cambia Testo</Text>
        </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12
  },
  subtitle: {
    fontSize: 18,
    color: '#7F8C8D',
    marginBottom: 20
  },
  count: {
    fontSize: 32,
    color: '#007AFF',
    marginBottom: 30
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
