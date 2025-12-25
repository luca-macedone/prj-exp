/**
 * SettingsScreen - Impostazioni con Tailwind/NativeWind
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';

export const SettingsScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { mode, setMode, colorScheme } = useTheme();
  const { resetDatabase, seedDatabase } = useData();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [monthlyReport, setMonthlyReport] = useState(false);

  const isDark = colorScheme === 'dark';

  const handleThemeChange = (newMode: 'light' | 'dark' | 'system') => {
    setMode(newMode);
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset Dati',
      'Sei sicuro di voler cancellare tutti i dati? Questa azione è irreversibile!',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetDatabase();
            Alert.alert('✅ Completato', 'Tutti i dati sono stati cancellati');
          }
        }
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert('Info', 'Funzione di export in sviluppo');
  };

  return (
    <SafeAreaView
      className={isDark ? 'flex-1 bg-background-primary-dark' : 'flex-1 bg-background-primary-light'}
      edges={['top', 'left', 'right']}
    >
      {/* Header */}
      <View className={`flex-row items-center justify-between px-4 py-3 border-b ${
        isDark ? 'border-background-secondary-dark' : 'border-border-light'
      }`}>
        <TouchableOpacity
          className={`w-10 h-10 rounded-xl items-center justify-center ${
            isDark ? 'bg-background-secondary-dark' : 'bg-background-secondary-light'
          }`}
          onPress={onClose}
        >
          <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#1A202C'} />
        </TouchableOpacity>
        <Text className={`text-xl font-bold ${
          isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
        }`}>
          Impostazioni
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Aspetto */}
        <View className="px-4 pt-6">
          <Text className="text-xs font-bold uppercase tracking-wide mb-3 text-text-secondary-dark">
            Aspetto
          </Text>

          <View className={`flex-row items-center p-4 rounded-2xl mb-3 ${
            isDark ? 'bg-background-card-dark' : 'bg-background-card-light shadow-sm'
          }`}>
            <View className={`w-11 h-11 rounded-xl items-center justify-center mr-3 ${
              isDark ? 'bg-background-secondary-dark' : 'bg-background-secondary-light'
            }`}>
              <Ionicons name="color-palette" size={22} color="#007AFF" />
            </View>
            <View className="flex-1">
              <Text className={`font-semibold mb-1 ${
                isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
              }`}>
                Tema
              </Text>
              <Text className={isDark ? 'text-text-secondary-dark text-sm' : 'text-text-secondary-light text-sm'}>
                Scegli il tema dell'app
              </Text>
            </View>
          </View>

          <View className="flex-row gap-2 mb-3">
            <TouchableOpacity
              className={`flex-1 items-center py-4 rounded-2xl border-2 ${
                mode === 'light'
                  ? 'border-primary bg-primary/10'
                  : isDark
                  ? 'border-transparent bg-background-card-dark'
                  : 'border-transparent bg-background-card-light shadow-sm'
              }`}
              onPress={() => handleThemeChange('light')}
            >
              <Ionicons
                name="sunny"
                size={24}
                color={mode === 'light' ? '#007AFF' : isDark ? '#A0AEC0' : '#4A5568'}
              />
              <Text className={`mt-2 font-semibold ${
                mode === 'light' ? 'text-primary' : isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'
              }`}>
                Chiaro
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 items-center py-4 rounded-2xl border-2 ${
                mode === 'dark'
                  ? 'border-primary bg-primary/10'
                  : isDark
                  ? 'border-transparent bg-background-card-dark'
                  : 'border-transparent bg-background-card-light shadow-sm'
              }`}
              onPress={() => handleThemeChange('dark')}
            >
              <Ionicons
                name="moon"
                size={24}
                color={mode === 'dark' ? '#007AFF' : isDark ? '#A0AEC0' : '#4A5568'}
              />
              <Text className={`mt-2 font-semibold ${
                mode === 'dark' ? 'text-primary' : isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'
              }`}>
                Scuro
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 items-center py-4 rounded-2xl border-2 ${
                mode === 'system'
                  ? 'border-primary bg-primary/10'
                  : isDark
                  ? 'border-transparent bg-background-card-dark'
                  : 'border-transparent bg-background-card-light shadow-sm'
              }`}
              onPress={() => handleThemeChange('system')}
            >
              <Ionicons
                name="phone-portrait"
                size={24}
                color={mode === 'system' ? '#007AFF' : isDark ? '#A0AEC0' : '#4A5568'}
              />
              <Text className={`mt-2 font-semibold ${
                mode === 'system' ? 'text-primary' : isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'
              }`}>
                Sistema
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifiche */}
        <View className="px-4 pt-6">
          <Text className="text-xs font-bold uppercase tracking-wide mb-3 text-text-secondary-dark">
            Notifiche
          </Text>

          <View className={`flex-row items-center justify-between p-4 rounded-2xl mb-2 ${
            isDark ? 'bg-background-card-dark' : 'bg-background-card-light shadow-sm'
          }`}>
            <View className="flex-row items-center flex-1">
              <View className={`w-11 h-11 rounded-xl items-center justify-center mr-3 ${
                isDark ? 'bg-background-secondary-dark' : 'bg-background-secondary-light'
              }`}>
                <Ionicons name="notifications" size={22} color="#007AFF" />
              </View>
              <View className="flex-1">
                <Text className={`font-semibold mb-1 ${
                  isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
                }`}>
                  Notifiche Push
                </Text>
                <Text className={isDark ? 'text-text-secondary-dark text-sm' : 'text-text-secondary-light text-sm'}>
                  Ricevi notifiche sull'app
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: isDark ? '#152039' : '#E2E8F0', true: '#007AFF60' }}
              thumbColor={notificationsEnabled ? '#007AFF' : '#718096'}
            />
          </View>

          <View className={`flex-row items-center justify-between p-4 rounded-2xl mb-2 ${
            isDark ? 'bg-background-card-dark' : 'bg-background-card-light shadow-sm'
          }`}>
            <View className="flex-row items-center flex-1">
              <View className={`w-11 h-11 rounded-xl items-center justify-center mr-3 ${
                isDark ? 'bg-background-secondary-dark' : 'bg-background-secondary-light'
              }`}>
                <Ionicons name="warning" size={22} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <Text className={`font-semibold mb-1 ${
                  isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
                }`}>
                  Avvisi Budget
                </Text>
                <Text className={isDark ? 'text-text-secondary-dark text-sm' : 'text-text-secondary-light text-sm'}>
                  Avvisa quando superi l'80% del budget
                </Text>
              </View>
            </View>
            <Switch
              value={budgetAlerts}
              onValueChange={setBudgetAlerts}
              trackColor={{ false: isDark ? '#152039' : '#E2E8F0', true: '#007AFF60' }}
              thumbColor={budgetAlerts ? '#007AFF' : '#718096'}
            />
          </View>

          <View className={`flex-row items-center justify-between p-4 rounded-2xl mb-2 ${
            isDark ? 'bg-background-card-dark' : 'bg-background-card-light shadow-sm'
          }`}>
            <View className="flex-row items-center flex-1">
              <View className={`w-11 h-11 rounded-xl items-center justify-center mr-3 ${
                isDark ? 'bg-background-secondary-dark' : 'bg-background-secondary-light'
              }`}>
                <Ionicons name="calendar" size={22} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className={`font-semibold mb-1 ${
                  isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
                }`}>
                  Report Mensile
                </Text>
                <Text className={isDark ? 'text-text-secondary-dark text-sm' : 'text-text-secondary-light text-sm'}>
                  Ricevi un riepilogo a fine mese
                </Text>
              </View>
            </View>
            <Switch
              value={monthlyReport}
              onValueChange={setMonthlyReport}
              trackColor={{ false: isDark ? '#152039' : '#E2E8F0', true: '#007AFF60' }}
              thumbColor={monthlyReport ? '#007AFF' : '#718096'}
            />
          </View>
        </View>

        {/* Sicurezza */}
        <View className="px-4 pt-6">
          <Text className="text-xs font-bold uppercase tracking-wide mb-3 text-text-secondary-dark">
            Sicurezza & Privacy
          </Text>

          <TouchableOpacity className={`flex-row items-center justify-between p-4 rounded-2xl mb-2 ${
            isDark ? 'bg-background-card-dark' : 'bg-background-card-light shadow-sm'
          }`}>
            <View className="flex-row items-center flex-1">
              <View className={`w-11 h-11 rounded-xl items-center justify-center mr-3 ${
                isDark ? 'bg-background-secondary-dark' : 'bg-background-secondary-light'
              }`}>
                <Ionicons name="lock-closed" size={22} color="#007AFF" />
              </View>
              <View className="flex-1">
                <Text className={`font-semibold mb-1 ${
                  isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
                }`}>
                  Cambia PIN
                </Text>
                <Text className={isDark ? 'text-text-secondary-dark text-sm' : 'text-text-secondary-light text-sm'}>
                  Modifica il PIN di accesso
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#718096" />
          </TouchableOpacity>

          <TouchableOpacity className={`flex-row items-center justify-between p-4 rounded-2xl mb-2 ${
            isDark ? 'bg-background-card-dark' : 'bg-background-card-light shadow-sm'
          }`}>
            <View className="flex-row items-center flex-1">
              <View className={`w-11 h-11 rounded-xl items-center justify-center mr-3 ${
                isDark ? 'bg-background-secondary-dark' : 'bg-background-secondary-light'
              }`}>
                <Ionicons name="finger-print" size={22} color="#007AFF" />
              </View>
              <View className="flex-1">
                <Text className={`font-semibold mb-1 ${
                  isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
                }`}>
                  Biometria
                </Text>
                <Text className={isDark ? 'text-text-secondary-dark text-sm' : 'text-text-secondary-light text-sm'}>
                  Face ID / Touch ID
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#718096" />
          </TouchableOpacity>
        </View>

        {/* Gestione Dati */}
        <View className="px-4 pt-6">
          <Text className="text-xs font-bold uppercase tracking-wide mb-3 text-text-secondary-dark">
            Gestione Dati
          </Text>

          <TouchableOpacity
            className={`flex-row items-center justify-between p-4 rounded-2xl mb-2 ${
              isDark ? 'bg-background-card-dark' : 'bg-background-card-light shadow-sm'
            }`}
            onPress={handleExportData}
          >
            <View className="flex-row items-center flex-1">
              <View className={`w-11 h-11 rounded-xl items-center justify-center mr-3 ${
                isDark ? 'bg-background-secondary-dark' : 'bg-background-secondary-light'
              }`}>
                <Ionicons name="cloud-download" size={22} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className={`font-semibold mb-1 ${
                  isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
                }`}>
                  Esporta Dati
                </Text>
                <Text className={isDark ? 'text-text-secondary-dark text-sm' : 'text-text-secondary-light text-sm'}>
                  Scarica i tuoi dati in CSV/JSON
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#718096" />
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-row items-center justify-between p-4 rounded-2xl mb-2 ${
              isDark ? 'bg-background-card-dark' : 'bg-background-card-light shadow-sm'
            }`}
            onPress={handleResetData}
          >
            <View className="flex-row items-center flex-1">
              <View className={`w-11 h-11 rounded-xl items-center justify-center mr-3 ${
                isDark ? 'bg-background-secondary-dark' : 'bg-background-secondary-light'
              }`}>
                <Ionicons name="trash" size={22} color="#EF4444" />
              </View>
              <View className="flex-1">
                <Text className={`font-semibold mb-1 ${
                  isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
                }`}>
                  Reset Dati
                </Text>
                <Text className={isDark ? 'text-text-secondary-dark text-sm' : 'text-text-secondary-light text-sm'}>
                  Cancella tutti i dati
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#718096" />
          </TouchableOpacity>
        </View>

        {/* Informazioni */}
        <View className="px-4 pt-6 pb-8">
          <Text className="text-xs font-bold uppercase tracking-wide mb-3 text-text-secondary-dark">
            Informazioni
          </Text>

          <TouchableOpacity className={`flex-row items-center justify-between p-4 rounded-2xl mb-2 ${
            isDark ? 'bg-background-card-dark' : 'bg-background-card-light shadow-sm'
          }`}>
            <View className="flex-row items-center flex-1">
              <View className={`w-11 h-11 rounded-xl items-center justify-center mr-3 ${
                isDark ? 'bg-background-secondary-dark' : 'bg-background-secondary-light'
              }`}>
                <Ionicons name="information-circle" size={22} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className={`font-semibold mb-1 ${
                  isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
                }`}>
                  Versione App
                </Text>
                <Text className={isDark ? 'text-text-secondary-dark text-sm' : 'text-text-secondary-light text-sm'}>
                  1.0.0 (Build 1)
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className={`flex-row items-center justify-between p-4 rounded-2xl mb-2 ${
            isDark ? 'bg-background-card-dark' : 'bg-background-card-light shadow-sm'
          }`}>
            <View className="flex-row items-center flex-1">
              <View className={`w-11 h-11 rounded-xl items-center justify-center mr-3 ${
                isDark ? 'bg-background-secondary-dark' : 'bg-background-secondary-light'
              }`}>
                <Ionicons name="help-circle" size={22} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className={`font-semibold mb-1 ${
                  isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
                }`}>
                  Aiuto & Supporto
                </Text>
                <Text className={isDark ? 'text-text-secondary-dark text-sm' : 'text-text-secondary-light text-sm'}>
                  FAQ e assistenza
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#718096" />
          </TouchableOpacity>

          <TouchableOpacity className={`flex-row items-center justify-between p-4 rounded-2xl ${
            isDark ? 'bg-background-card-dark' : 'bg-background-card-light shadow-sm'
          }`}>
            <View className="flex-row items-center flex-1">
              <View className={`w-11 h-11 rounded-xl items-center justify-center mr-3 ${
                isDark ? 'bg-background-secondary-dark' : 'bg-background-secondary-light'
              }`}>
                <Ionicons name="document-text" size={22} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className={`font-semibold mb-1 ${
                  isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
                }`}>
                  Privacy Policy
                </Text>
                <Text className={isDark ? 'text-text-secondary-dark text-sm' : 'text-text-secondary-light text-sm'}>
                  Termini e condizioni
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#718096" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
