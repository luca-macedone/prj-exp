/**
 * DeveloperMenu - Menu sviluppatore per reset e seed database con Tailwind
 * Accessibile con shake gesture o long press in alto a sinistra
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Accelerometer } from 'expo-sensors';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';

export const DeveloperMenu: React.FC = () => {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  const [visible, setVisible] = useState(false);
  const { resetDatabase, seedDatabase, transactions, budgets } = useData();
  const [shakeCount, setShakeCount] = useState(0);

  useEffect(() => {
    let subscription: any;

    // Solo in development mode
    if (__DEV__) {
      Accelerometer.setUpdateInterval(100);

      subscription = Accelerometer.addListener(({ x, y, z }) => {
        const acceleration = Math.sqrt(x * x + y * y + z * z);

        // Detect shake (acceleration > 2.5 G)
        if (acceleration > 2.5) {
          setShakeCount((prev) => {
            const newCount = prev + 1;
            if (newCount >= 3) {
              setVisible(true);
              return 0;
            }
            return newCount;
          });
        }
      });

      // Reset shake count dopo 1 secondo
      const timer = setInterval(() => {
        setShakeCount(0);
      }, 1000);

      return () => {
        subscription?.remove();
        clearInterval(timer);
      };
    }
  }, []);

  const handleReset = () => {
    Alert.alert(
      'Reset Database',
      'Sei sicuro di voler cancellare TUTTI i dati? Questa azione è irreversibile!',
      [
        {
          text: 'Annulla',
          style: 'cancel'
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetDatabase();
            setVisible(false);
            Alert.alert('✅ Database Resettato', 'Il database è stato resettato con successo!');
          }
        }
      ]
    );
  };

  const handleSeed = () => {
    Alert.alert(
      'Seed Database',
      'Vuoi popolare il database con dati di esempio? (15 transazioni e 4 budget)',
      [
        {
          text: 'Annulla',
          style: 'cancel'
        },
        {
          text: 'Seed',
          onPress: async () => {
            await seedDatabase();
            setVisible(false);
            Alert.alert('✅ Database Popolato', 'Il database è stato popolato con dati di esempio!');
          }
        }
      ]
    );
  };

  if (!__DEV__) {
    return null; // Non mostrare in production
  }

  return (
    <>
      {/* Developer Icon - Long press to open */}
      <TouchableOpacity
        className="absolute top-[50px] left-4 w-8 h-8 rounded-full justify-center items-center z-[1000] border"
        style={{
          backgroundColor: '#F59E0B20',
          borderColor: '#F59E0B40'
        }}
        onLongPress={() => setVisible(true)}
        delayLongPress={1000}
      >
        <Ionicons name="bug" size={16} color="#F59E0B" />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View className="flex-1 bg-black/80 justify-center items-center px-6">
          <View className={`w-full max-w-[400px] rounded-3xl p-6 ${
            isDark ? 'bg-background-card-dark' : 'bg-background-card-light shadow-lg'
          }`}>
            {/* Header */}
            <View className="flex-row items-center mb-6 gap-3">
              <Ionicons name="construct" size={28} color="#007AFF" />
              <Text className={`flex-1 text-2xl font-bold ${
                isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
              }`}>
                Developer Tools
              </Text>
              <TouchableOpacity
                className={`w-9 h-9 rounded-xl justify-center items-center ${
                  isDark ? 'bg-background-secondary-dark' : 'bg-background-secondary-light'
                }`}
                onPress={() => setVisible(false)}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={isDark ? '#D1D5DB' : '#6B7280'}
                />
              </TouchableOpacity>
            </View>

            {/* Stats */}
            <View className="flex-row gap-3 mb-6">
              <View className={`flex-1 p-4 rounded-xl items-center ${
                isDark ? 'bg-background-secondary-dark' : 'bg-background-secondary-light'
              }`}>
                <Text className="text-primary text-3xl font-bold mb-1">
                  {transactions.length}
                </Text>
                <Text className={`text-sm ${
                  isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'
                }`}>
                  Transazioni
                </Text>
              </View>
              <View className={`flex-1 p-4 rounded-xl items-center ${
                isDark ? 'bg-background-secondary-dark' : 'bg-background-secondary-light'
              }`}>
                <Text className="text-primary text-3xl font-bold mb-1">
                  {budgets.length}
                </Text>
                <Text className={`text-sm ${
                  isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'
                }`}>
                  Budget
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View className="gap-3 mb-4">
              <TouchableOpacity
                className="bg-success p-4 rounded-xl items-center gap-1"
                onPress={handleSeed}
              >
                <Ionicons name="flash" size={24} color="#FFFFFF" />
                <Text className="text-white text-base font-bold">
                  Seed Database
                </Text>
                <Text className="text-white/80 text-sm">
                  Aggiungi dati di esempio
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-error p-4 rounded-xl items-center gap-1"
                onPress={handleReset}
              >
                <Ionicons name="trash" size={24} color="#FFFFFF" />
                <Text className="text-white text-base font-bold">
                  Reset Database
                </Text>
                <Text className="text-white/80 text-sm">
                  Cancella tutti i dati
                </Text>
              </TouchableOpacity>
            </View>

            {/* Info */}
            <View className={`flex-row items-center gap-2 p-3 rounded-lg ${
              isDark ? 'bg-background-secondary-dark' : 'bg-background-secondary-light'
            }`}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={isDark ? '#9CA3AF' : '#9CA3AF'}
              />
              <Text className={`flex-1 text-xs ${
                isDark ? 'text-text-tertiary-dark' : 'text-text-tertiary-light'
              }`}>
                {Platform.OS === 'ios' ? 'Shake device' : 'Shake o long press'} per aprire questo menu
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};
