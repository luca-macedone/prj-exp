/**
 * WelcomeScreen - First screen shown to users
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface WelcomeScreenProps {
  onLogin: () => void;
  onRegister: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onLogin,
  onRegister
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Personal Finance</Text>
        <Text style={styles.subtitle}>
          Gestisci le tue finanze in modo sicuro e privato
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={onLogin}
          >
            <Text style={styles.primaryButtonText}>Accedi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={onRegister}
          >
            <Text style={styles.secondaryButtonText}>Registrati</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.privacyNote}>
          I tuoi dati sono salvati solo sul tuo dispositivo.{'\n'}
          Massima privacy garantita.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA'
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 48
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 16
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center'
  },
  primaryButton: {
    backgroundColor: '#007AFF'
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600'
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#007AFF'
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600'
  },
  privacyNote: {
    marginTop: 48,
    fontSize: 12,
    color: '#95A5A6',
    textAlign: 'center'
  }
});
