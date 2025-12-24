/**
 * UnlockScreen - Unlock app with biometrics or PIN
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthService from '../../services/authentication/AuthService';

interface UnlockScreenProps {
  onSuccess: () => void;
}

export const UnlockScreen: React.FC<UnlockScreenProps> = ({ onSuccess }) => {
  const [showPinOption, setShowPinOption] = useState(false);

  useEffect(() => {
    // Try biometric unlock automatically on mount
    tryBiometricUnlock();
  }, []);

  const tryBiometricUnlock = async () => {
    const result = await AuthService.unlockWithBiometrics();

    if (result.success) {
      onSuccess();
    } else {
      // Biometric failed or not available, show PIN option
      setShowPinOption(true);
    }
  };

  const handlePinUnlock = () => {
    Alert.prompt(
      'Inserisci PIN',
      'Sblocca con il tuo PIN',
      async (pin: string) => {
        if (!pin) return;

        const result = await AuthService.verifyPIN(pin);

        if (result.success) {
          onSuccess();
        } else {
          Alert.alert('Errore', result.error || 'PIN non valido');
        }
      },
      'secure-text'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>App Bloccata</Text>
        <Text style={styles.subtitle}>
          Sblocca per accedere alle tue finanze
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={tryBiometricUnlock}
          >
            <Text style={styles.buttonText}>
              Usa Biometria
            </Text>
          </TouchableOpacity>

          {showPinOption && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handlePinUnlock}
            >
              <Text style={styles.secondaryButtonText}>
                Usa PIN
              </Text>
            </TouchableOpacity>
          )}
        </View>
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
    fontSize: 32,
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
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center'
  },
  buttonText: {
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
  }
});
