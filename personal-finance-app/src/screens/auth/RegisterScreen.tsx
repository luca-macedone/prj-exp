/**
 * RegisterScreen - User registration with Tailwind
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthService from '../../services/authentication/AuthService';

interface RegisterScreenProps {
  onSuccess: () => void;
  onBack: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onSuccess,
  onBack
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (!email || !password || !confirmPassword || !pin || !confirmPin) {
      Alert.alert('Errore', 'Compila tutti i campi');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Errore', 'Le password non coincidono');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Errore', 'La password deve essere di almeno 6 caratteri');
      return;
    }

    if (pin.length < 4 || pin.length > 6) {
      Alert.alert('Errore', 'Il PIN deve essere di 4-6 cifre');
      return;
    }

    if (!/^\d+$/.test(pin)) {
      Alert.alert('Errore', 'Il PIN deve contenere solo numeri');
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert('Errore', 'I PIN non coincidono');
      return;
    }

    setLoading(true);
    try {
      const result = await AuthService.registerUser(email, password);

      if (result.success) {
        // Imposta il PIN
        const pinSet = await AuthService.setPIN(pin);
        if (pinSet) {
          Alert.alert(
            'Registrazione completata',
            'Account creato con successo!',
            [{ text: 'OK', onPress: onSuccess }]
          );
        } else {
          Alert.alert('Errore', 'Impossibile impostare il PIN');
        }
      } else {
        Alert.alert('Errore', result.error || 'Registrazione fallita');
      }
    } catch (error) {
      Alert.alert('Errore', 'Si è verificato un errore');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]">
      <View className="flex-1 px-6">
        <Text className="text-3xl font-bold text-[#2C3E50] mt-6 mb-2">
          Crea Account
        </Text>
        <Text className="text-sm text-[#7F8C8D] mb-8">
          I tuoi dati rimarranno sul tuo dispositivo
        </Text>

        <View className="w-full max-w-[400px]">
          <TextInput
            className="bg-white border border-[#E5E5EA] rounded-xl px-4 py-3.5 text-base mb-4"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            className="bg-white border border-[#E5E5EA] rounded-xl px-4 py-3.5 text-base mb-4"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            className="bg-white border border-[#E5E5EA] rounded-xl px-4 py-3.5 text-base mb-4"
            placeholder="Conferma Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            className="bg-white border border-[#E5E5EA] rounded-xl px-4 py-3.5 text-base mb-4"
            placeholder="PIN (4-6 cifre)"
            value={pin}
            onChangeText={setPin}
            keyboardType="numeric"
            secureTextEntry
            maxLength={6}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            className="bg-white border border-[#E5E5EA] rounded-xl px-4 py-3.5 text-base mb-4"
            placeholder="Conferma PIN"
            value={confirmPin}
            onChangeText={setConfirmPin}
            keyboardType="numeric"
            secureTextEntry
            maxLength={6}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            className={`bg-primary py-4 rounded-xl items-center mt-2 ${
              loading ? 'opacity-60' : ''
            }`}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white text-lg font-semibold">
                Registrati
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="py-3 items-center mt-4"
            onPress={onBack}
            disabled={loading}
          >
            <Text className="text-primary text-base">
              Indietro
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
