/**
 * LoginScreen - User login with Tailwind
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AuthService, { UserInfo } from '../../services/authentication/AuthService';

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
  const [users, setUsers] = useState<UserInfo[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const registeredUsers = await AuthService.getAllUsers();
    setUsers(registeredUsers);
  };

  const selectUser = (userEmail: string) => {
    setEmail(userEmail);
  };

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
      <ScrollView className="flex-1 px-6">
        <Text className="text-3xl font-bold text-[#2C3E50] mt-6 mb-2">
          Bentornato
        </Text>
        <Text className="text-sm text-[#7F8C8D] mb-6">
          Accedi al tuo account
        </Text>

        <View className="w-full max-w-[400px]">
          {/* Registered Users List */}
          {users.length > 0 && (
            <View className="mb-6">
              <Text className="text-xs font-semibold text-[#95A5A6] uppercase tracking-wide mb-3">
                Utenti Registrati
              </Text>
              {users.map((user) => (
                <TouchableOpacity
                  key={user.userId}
                  className={`flex-row items-center justify-between bg-white border rounded-xl px-4 py-3.5 mb-2 ${
                    email === user.email ? 'border-primary' : 'border-[#E5E5EA]'
                  }`}
                  onPress={() => selectUser(user.email)}
                >
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-3">
                      <Ionicons name="person" size={20} color="#007AFF" />
                    </View>
                    <Text className={`text-base ${
                      email === user.email ? 'text-primary font-semibold' : 'text-[#2C3E50]'
                    }`}>
                      {user.email}
                    </Text>
                  </View>
                  {email === user.email && (
                    <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
              <Text className="text-xs text-[#95A5A6] mt-2 mb-4">
                oppure inserisci una nuova email
              </Text>
            </View>
          )}

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
      </ScrollView>
    </SafeAreaView>
  );
};
