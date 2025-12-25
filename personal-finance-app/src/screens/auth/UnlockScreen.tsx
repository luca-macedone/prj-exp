/**
 * UnlockScreen - Unlock app with biometrics or PIN with Tailwind
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
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
    <SafeAreaView className="flex-1 bg-[#F5F7FA]">
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-3xl font-bold text-[#2C3E50] mb-3">
          App Bloccata
        </Text>
        <Text className="text-base text-[#7F8C8D] text-center mb-12">
          Sblocca per accedere alle tue finanze
        </Text>

        <View className="w-full max-w-[300px] gap-4">
          <TouchableOpacity
            className="bg-primary py-4 px-8 rounded-xl items-center"
            onPress={tryBiometricUnlock}
          >
            <Text className="text-white text-lg font-semibold">
              Usa Biometria
            </Text>
          </TouchableOpacity>

          {showPinOption && (
            <TouchableOpacity
              className="bg-white py-4 px-8 rounded-xl items-center border-2 border-primary"
              onPress={handlePinUnlock}
            >
              <Text className="text-primary text-lg font-semibold">
                Usa PIN
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};
