/**
 * LoginScreen - User login with Tailwind
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

interface LoginScreenProps {
  onSuccess: () => void;
  onBack: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onSuccess,
  onBack
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Errore', 'Inserisci email e password');
      return;
    }

    setLoading(true);
    try {
      const result = await AuthService.loginUser(email, password);

      if (result.success) {
        onSuccess();
      } else {
        Alert.alert('Errore', result.error || 'Login fallito');
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
          Bentornato
        </Text>
        <Text className="text-sm text-[#7F8C8D] mb-8">
          Accedi al tuo account
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

          <TouchableOpacity
            className={`bg-primary py-4 rounded-xl items-center mt-2 ${
              loading ? 'opacity-60' : ''
            }`}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white text-lg font-semibold">
                Accedi
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
