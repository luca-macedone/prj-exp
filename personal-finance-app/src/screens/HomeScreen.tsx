/**
 * HomeScreen - Dashboard principale con Tailwind/NativeWind
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { QuickTransactionForm } from '../components/QuickTransactionForm';
import { SettingsScreen } from './SettingsScreen';
import { NotificationsScreen } from './NotificationsScreen';

export const HomeScreen: React.FC = () => {
  const { transactions, addTransaction } = useData();
  const { colorScheme } = useTheme();
  const navigation = useNavigation();
  const [quickAddVisible, setQuickAddVisible] = React.useState(false);
  const [settingsVisible, setSettingsVisible] = React.useState(false);
  const [notificationsVisible, setNotificationsVisible] = React.useState(false);

  const isDark = colorScheme === 'dark';

  // Calcola il saldo totale
  const totalBalance = transactions.reduce((sum, t) => sum + t.amount, 0);

  // Calcola entrate e uscite del mese
  const now = Date.now();
  const monthStart = new Date(new Date(now).setDate(1)).getTime();
  const thisMonthTransactions = transactions.filter(t => t.date >= monthStart);

  const monthIncome = thisMonthTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const monthExpenses = Math.abs(
    thisMonthTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const savingsGoal = 1000;
  const currentSavings = totalBalance > 0 ? Math.min(totalBalance, savingsGoal) : 0;
  const savingsProgress = (currentSavings / savingsGoal) * 100;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Handlers
  const handleQuickAdd = () => setQuickAddVisible(true);
  const handleTransfer = () => console.log('Trasferimento non ancora implementato');
  const handleAnalyze = () => (navigation as any).navigate('Analytics');
  const handleMore = () => setSettingsVisible(true);
  const handleNotifications = () => setNotificationsVisible(true);
  const handleViewAllTransactions = () => (navigation as any).navigate('Transactions');

  const handleAddTransaction = async (data: {
    amount: number;
    description: string;
    category: string;
  }) => {
    const result = await addTransaction({
      amount: data.amount,
      description: data.description,
      category: data.category,
      date: Date.now(),
      accountId: 'default-account'
    });

    if (result) setQuickAddVisible(false);
  };

  return (
    <SafeAreaView
      className={isDark ? 'flex-1 bg-background-primary-dark' : 'flex-1 bg-background-primary-light'}
      edges={['top', 'left', 'right']}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-6">
          <View className="flex-row items-center">
            <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-3 ${
              isDark ? 'bg-background-secondary-dark' : 'bg-background-secondary-light'
            }`}>
              <Ionicons name="shield-checkmark" size={24} color="#007AFF" />
            </View>
            <View>
              <Text className={isDark ? 'text-text-secondary-dark text-sm' : 'text-text-secondary-light text-sm'}>
                Buongiorno,
              </Text>
              <Text className={isDark ? 'text-text-primary-dark text-lg font-bold' : 'text-text-primary-light text-lg font-bold'}>
                Marco
              </Text>
            </View>
          </View>
          <TouchableOpacity
            className={`w-10 h-10 rounded-xl items-center justify-center ${
              isDark ? 'bg-background-secondary-dark' : 'bg-background-secondary-light'
            }`}
            onPress={handleNotifications}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={isDark ? '#FFFFFF' : '#1A202C'}
            />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View className={`mx-4 mb-6 p-6 rounded-3xl ${
          isDark ? 'bg-background-card-dark' : 'bg-background-card-light shadow-lg'
        }`}>
          <View className="flex-row items-center justify-between mb-4">
            <Text className={isDark ? 'text-text-secondary-dark text-sm' : 'text-text-secondary-light text-sm'}>
              Saldo Totale
            </Text>
            <View className="w-8 h-8 rounded-full bg-success/20 items-center justify-center">
              <Ionicons name="trending-up" size={16} color="#10B981" />
            </View>
          </View>

          <Text className={`text-4xl font-bold mb-6 ${
            isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
          }`}>
            {formatCurrency(totalBalance)}
          </Text>

          <View className="flex-row justify-between">
            <View className="flex-1 mr-2">
              <Text className={isDark ? 'text-text-tertiary-dark text-xs mb-1' : 'text-text-tertiary-light text-xs mb-1'}>
                Entrate
              </Text>
              <Text className="text-success text-base font-semibold">
                +{formatCurrency(monthIncome)}
              </Text>
            </View>
            <View className="flex-1 ml-2">
              <Text className={isDark ? 'text-text-tertiary-dark text-xs mb-1' : 'text-text-tertiary-light text-xs mb-1'}>
                Spese
              </Text>
              <Text className="text-error text-base font-semibold">
                -{formatCurrency(monthExpenses)}
              </Text>
            </View>
          </View>
        </View>

        {/* Savings Goal */}
        <View className={`mx-4 mb-6 p-5 rounded-2xl ${
          isDark ? 'bg-background-card-dark' : 'bg-background-card-light shadow-md'
        }`}>
          <View className="flex-row items-center justify-between mb-3">
            <Text className={`font-semibold ${
              isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
            }`}>
              Obiettivo Risparmio
            </Text>
            <Text className={isDark ? 'text-text-secondary-dark text-sm' : 'text-text-secondary-light text-sm'}>
              {savingsProgress.toFixed(0)}%
            </Text>
          </View>
          <View className={`h-2 rounded-full mb-2 ${
            isDark ? 'bg-background-secondary-dark' : 'bg-gray-200'
          }`}>
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: `${Math.min(savingsProgress, 100)}%` }}
            />
          </View>
          <View className="flex-row justify-between">
            <Text className={isDark ? 'text-text-tertiary-dark text-xs' : 'text-text-tertiary-light text-xs'}>
              {formatCurrency(currentSavings)}
            </Text>
            <Text className={isDark ? 'text-text-tertiary-dark text-xs' : 'text-text-tertiary-light text-xs'}>
              {formatCurrency(savingsGoal)}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-4 mb-6">
          <Text className={`text-base font-bold mb-4 ${
            isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
          }`}>
            Azioni Rapide
          </Text>
          <View className="flex-row flex-wrap justify-between">
            <TouchableOpacity
              className="w-[48%] mb-3"
              onPress={handleQuickAdd}
            >
              <View className={`items-center p-4 rounded-2xl ${
                isDark ? 'bg-background-card-dark' : 'bg-background-card-light shadow-sm'
              }`}>
                <View className="w-14 h-14 rounded-2xl bg-primary/20 items-center justify-center mb-2">
                  <Ionicons name="add" size={28} color="#007AFF" />
                </View>
                <Text className={`text-sm font-semibold ${
                  isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
                }`}>
                  Aggiungi
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-[48%] mb-3"
              onPress={handleTransfer}
            >
              <View className={`items-center p-4 rounded-2xl ${
                isDark ? 'bg-background-card-dark' : 'bg-background-card-light shadow-sm'
              }`}>
                <View className="w-14 h-14 rounded-2xl bg-warning/20 items-center justify-center mb-2">
                  <Ionicons name="swap-horizontal" size={28} color="#F59E0B" />
                </View>
                <Text className={`text-sm font-semibold ${
                  isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
                }`}>
                  Trasferisci
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-[48%] mb-3"
              onPress={handleAnalyze}
            >
              <View className={`items-center p-4 rounded-2xl ${
                isDark ? 'bg-background-card-dark' : 'bg-background-card-light shadow-sm'
              }`}>
                <View className="w-14 h-14 rounded-2xl bg-success/20 items-center justify-center mb-2">
                  <Ionicons name="stats-chart" size={28} color="#10B981" />
                </View>
                <Text className={`text-sm font-semibold ${
                  isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
                }`}>
                  Analizza
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-[48%] mb-3"
              onPress={handleMore}
            >
              <View className={`items-center p-4 rounded-2xl ${
                isDark ? 'bg-background-card-dark' : 'bg-background-card-light shadow-sm'
              }`}>
                <View className="w-14 h-14 rounded-2xl bg-info/20 items-center justify-center mb-2">
                  <Ionicons name="settings" size={28} color="#3B82F6" />
                </View>
                <Text className={`text-sm font-semibold ${
                  isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
                }`}>
                  Altro
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions */}
        <View className="px-4 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className={`text-base font-bold ${
              isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
            }`}>
              Transazioni Recenti
            </Text>
            <TouchableOpacity onPress={handleViewAllTransactions}>
              <Text className="text-primary text-sm font-semibold">Vedi tutte</Text>
            </TouchableOpacity>
          </View>

          {transactions.slice(0, 3).map((transaction) => (
            <View
              key={transaction.id}
              className={`flex-row items-center justify-between p-4 rounded-2xl mb-3 ${
                isDark ? 'bg-background-card-dark' : 'bg-background-card-light shadow-sm'
              }`}
            >
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 rounded-2xl bg-category-food/20 items-center justify-center mr-3">
                  <Ionicons name="restaurant" size={20} color="#FF6B6B" />
                </View>
                <View className="flex-1">
                  <Text className={`font-semibold ${
                    isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
                  }`}>
                    {transaction.description}
                  </Text>
                  <Text className={isDark ? 'text-text-tertiary-dark text-xs' : 'text-text-tertiary-light text-xs'}>
                    {transaction.category}
                  </Text>
                </View>
              </View>
              <Text className={`text-base font-bold ${
                transaction.amount < 0 ? 'text-error' : 'text-success'
              }`}>
                {transaction.amount < 0 ? '-' : '+'}
                {formatCurrency(Math.abs(transaction.amount))}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Modals */}
      <QuickTransactionForm
        visible={quickAddVisible}
        onClose={() => setQuickAddVisible(false)}
        onSubmit={handleAddTransaction}
      />

      {settingsVisible && (
        <View className="absolute top-0 left-0 right-0 bottom-0">
          <SettingsScreen onClose={() => setSettingsVisible(false)} />
        </View>
      )}

      {notificationsVisible && (
        <View className="absolute top-0 left-0 right-0 bottom-0">
          <NotificationsScreen onClose={() => setNotificationsVisible(false)} />
        </View>
      )}
    </SafeAreaView>
  );
};
