/**
 * UnlockScreen - Unlock app with biometrics or PIN with Tailwind
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthService from '../../services/authentication/AuthService';
import * as SecureStore from 'expo-secure-store';

interface UnlockScreenProps {
  onSuccess: () => void;
  onChangeUser: () => void;
}

export const UnlockScreen: React.FC<UnlockScreenProps> = ({ onSuccess, onChangeUser }) => {
  const [showPinOption, setShowPinOption] = useState(false);
  const [showPasswordOption, setShowPasswordOption] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');

  useEffect(() => {
    loadUserEmail();
    // Try biometric unlock automatically on mount
    tryBiometricUnlock();
  }, []);

  const loadUserEmail = async () => {
    const email = await SecureStore.getItemAsync('user_email');
    if (email) {
      setUserEmail(email);
    }
  };

  const tryBiometricUnlock = async () => {
    const result = await AuthService.unlockWithBiometrics();

    if (result.success) {
      onSuccess();
    } else {
      // Biometric failed or not available, show PIN option
      setShowPinOption(true);
    }
  };

  const handlePinUnlock = async () => {
    if (!pin) {
      Alert.alert('Errore', 'Inserisci il PIN');
      return;
    }

    const result = await AuthService.verifyPIN(pin);

    if (result.success) {
      onSuccess();
    } else {
      Alert.alert('Errore', result.error || 'PIN non valido');
      setPin('');
    }
  };

  const handlePasswordUnlock = async () => {
    if (!password) {
      Alert.alert('Errore', 'Inserisci la password');
      return;
    }

    const result = await AuthService.loginUser(userEmail, password);

    if (result.success) {
      onSuccess();
    } else {
      Alert.alert('Errore', result.error || 'Password non valida');
      setPassword('');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]">
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-3xl font-bold text-[#2C3E50] mb-3">
          Bentornato
        </Text>
        {userEmail && (
          <Text className="text-base text-[#7F8C8D] text-center mb-2">
            {userEmail}
          </Text>
        )}
        <Text className="text-sm text-[#95A5A6] text-center mb-12">
          Sblocca per accedere alle tue finanze
        </Text>

        <View className="w-full max-w-[300px]">
          {/* Biometric Unlock */}
          {!showPasswordOption && (
            <TouchableOpacity
              className="bg-primary py-4 px-8 rounded-xl items-center mb-3"
              onPress={tryBiometricUnlock}
            >
              <Text className="text-white text-lg font-semibold">
                Usa Biometria
              </Text>
            </TouchableOpacity>
          )}

          {/* PIN Unlock */}
          {showPinOption && !showPasswordOption && (
            <View className="mb-3">
              <TextInput
                className="bg-white border border-[#E5E5EA] rounded-xl px-4 py-3.5 text-base mb-3"
                placeholder="Inserisci PIN"
                value={pin}
                onChangeText={setPin}
                keyboardType="numeric"
                secureTextEntry
                maxLength={6}
              />
              <TouchableOpacity
                className="bg-primary py-4 px-8 rounded-xl items-center"
                onPress={handlePinUnlock}
              >
                <Text className="text-white text-lg font-semibold">
                  Sblocca con PIN
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Password Unlock */}
          {showPasswordOption && (
            <View className="mb-3">
              <TextInput
                className="bg-white border border-[#E5E5EA] rounded-xl px-4 py-3.5 text-base mb-3"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
              <TouchableOpacity
                className="bg-primary py-4 px-8 rounded-xl items-center"
                onPress={handlePasswordUnlock}
              >
                <Text className="text-white text-lg font-semibold">
                  Sblocca con Password
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Toggle Options */}
          <View className="mt-4 gap-2">
            {!showPasswordOption && (
              <TouchableOpacity
                className="py-3 items-center"
                onPress={() => {
                  setShowPasswordOption(true);
                  setShowPinOption(false);
                }}
              >
                <Text className="text-primary text-base">
                  Usa password invece
                </Text>
              </TouchableOpacity>
            )}

            {showPasswordOption && (
              <TouchableOpacity
                className="py-3 items-center"
                onPress={() => {
                  setShowPasswordOption(false);
                  setShowPinOption(true);
                }}
              >
                <Text className="text-primary text-base">
                  Usa biometria/PIN invece
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className="py-3 items-center border-t border-[#E5E5EA] mt-2"
              onPress={onChangeUser}
            >
              <Text className="text-[#7F8C8D] text-base">
                Cambia utente
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};
