/**
 * TransactionsScreen
 * Schermata principale per visualizzare e gestire transazioni
 */

import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { TransactionList } from '../features/transactions';
import { QuickTransactionForm } from '../components/QuickTransactionForm';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';

export const TransactionsScreen: React.FC = () => {
  const {
    transactions,
    loading,
    addTransaction,
    refreshData
  } = useData();

  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleAddTransaction = async (data: {
    amount: number;
    description: string;
    category: string;
    merchant?: string;
  }) => {
    try {
      const result = await addTransaction({
        amount: data.amount,
        description: data.description,
        category: data.category,
        date: Date.now(),
        accountId: 'default-account',
        merchant: data.merchant
      });

      if (result) {
        setModalVisible(false);
        Toast.show({
          type: 'success',
          text1: 'Transazione aggiunta!',
          text2: `${data.amount > 0 ? '+' : ''}€${Math.abs(data.amount).toFixed(2)} - ${data.description}`,
          position: 'bottom',
        });
      }
    } catch (err) {
      console.error('Errore aggiunta transazione:', err);
      Toast.show({
        type: 'error',
        text1: 'Errore',
        text2: 'Impossibile aggiungere la transazione',
        position: 'bottom',
      });
    }
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-background-primary-dark' : 'bg-background-primary-light'}`}
      edges={['top', 'left', 'right']}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 pt-3 pb-4">
        <View>
          <Text className={`text-3xl font-bold mb-1 ${
            isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
          }`}>
            Transazioni
          </Text>
          <Text className={`text-sm ${
            isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'
          }`}>
            {transactions.length} totali
          </Text>
        </View>
        <TouchableOpacity
          className={`w-10 h-10 rounded-xl items-center justify-center ${
            isDark ? 'bg-background-secondary-dark' : 'bg-background-secondary-light'
          }`}
        >
          <Ionicons
            name="filter"
            size={20}
            color={isDark ? '#A0AEC0' : '#4A5568'}
          />
        </TouchableOpacity>
      </View>

      {/* Add Button */}
      <TouchableOpacity
        className={`flex-row items-center justify-center bg-primary py-3.5 px-5 rounded-xl mx-4 mb-4 ${
          isDark ? '' : 'shadow-md'
        }`}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add-circle" size={24} color="#FFFFFF" />
        <Text className="text-white text-base font-semibold ml-2">
          Nuova Transazione
        </Text>
      </TouchableOpacity>

      {/* Error */}
      {error && (
        <View className="flex-row items-center bg-warning/20 px-4 py-3 mx-4 mb-4 rounded-xl gap-2">
          <Ionicons name="alert-circle" size={20} color="#F59E0B" />
          <Text className="flex-1 text-warning text-sm">{error}</Text>
        </View>
      )}

      {/* Transactions List */}
      <TransactionList
        transactions={transactions}
        loading={loading}
        onRefresh={refreshData}
        onTransactionPress={(transaction) => {
          // TODO: Navigate to transaction details
          console.log('Transaction pressed:', transaction);
        }}
      />

      {/* Quick Transaction Form */}
      <QuickTransactionForm
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddTransaction}
      />
    </SafeAreaView>
  );
};
