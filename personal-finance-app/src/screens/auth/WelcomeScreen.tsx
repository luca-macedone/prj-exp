/**
 * WelcomeScreen - First screen shown to users with Tailwind
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity
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
    <SafeAreaView className="flex-1 bg-[#F5F7FA]">
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-4xl font-bold text-[#2C3E50] mb-3">
          Personal Finance
        </Text>
        <Text className="text-base text-[#7F8C8D] text-center mb-12">
          Gestisci le tue finanze in modo sicuro e privato
        </Text>

        <View className="w-full max-w-[300px] gap-4">
          <TouchableOpacity
            className="bg-primary py-4 px-8 rounded-xl items-center"
            onPress={onLogin}
          >
            <Text className="text-white text-lg font-semibold">
              Accedi
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white py-4 px-8 rounded-xl items-center border-2 border-primary"
            onPress={onRegister}
          >
            <Text className="text-primary text-lg font-semibold">
              Registrati
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="mt-12 text-xs text-[#95A5A6] text-center">
          I tuoi dati sono salvati solo sul tuo dispositivo.{'\n'}
          Massima privacy garantita.
        </Text>
      </View>
    </SafeAreaView>
  );
};
