/**
 * TransactionList Component
 * Visualizza lista di transazioni con performance ottimizzate (Tailwind)
 */

import React from 'react';
import {
  FlatList,
  View,
  Text,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../../../types';
import { useTheme } from '../../../context/ThemeContext';

interface TransactionListProps {
  transactions: Transaction[];
  loading?: boolean;
  onRefresh?: () => Promise<void>;
  onTransactionPress?: (transaction: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  loading = false,
  onRefresh,
  onTransactionPress
}) => {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
  };

  const renderItem = ({ item }: { item: Transaction }) => (
    <TransactionItem
      transaction={item}
      onPress={() => onTransactionPress?.(item)}
      isDark={isDark}
    />
  );

  const keyExtractor = (item: Transaction) => item.id;

  if (loading && transactions.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-12">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className={`mt-4 text-base ${isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'}`}>
          Caricamento transazioni...
        </Text>
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-12">
        <View className="mb-8">
          <Ionicons name="wallet-outline" size={80} color={isDark ? '#718096' : '#9CA3AF'} />
        </View>
        <Text className={`text-2xl font-bold mb-4 ${isDark ? 'text-text-primary-dark' : 'text-text-primary-light'}`}>
          Nessuna transazione
        </Text>
        <Text className={`text-base text-center leading-6 mb-12 ${isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'}`}>
          Inizia a tracciare le tue spese e{'\n'}guadagni per avere il controllo{'\n'}delle tue finanze
        </Text>
        <View className={`w-full rounded-xl p-6 ${isDark ? 'bg-background-secondary-dark' : 'bg-background-secondary-light'}`}>
          <View className="flex-row items-center mb-4">
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text className={`ml-4 text-sm flex-1 ${isDark ? 'text-text-primary-dark' : 'text-text-primary-light'}`}>
              Aggiungi ogni spesa giornaliera
            </Text>
          </View>
          <View className="flex-row items-center mb-4">
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text className={`ml-4 text-sm flex-1 ${isDark ? 'text-text-primary-dark' : 'text-text-primary-light'}`}>
              Categorizza per capire dove spendi
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text className={`ml-4 text-sm flex-1 ${isDark ? 'text-text-primary-dark' : 'text-text-primary-light'}`}>
              Monitora i tuoi progressi
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <FlatList
      data={transactions}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        ) : undefined
      }
      contentContainerStyle={{ padding: 16 }}
      // Performance ottimizzazioni
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={15}
      windowSize={10}
    />
  );
};

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
  isDark: boolean;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onPress, isDark }) => {
  const isExpense = transaction.amount < 0;
  const formattedDate = new Date(transaction.date).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const formattedAmount = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(Math.abs(transaction.amount));

  const categoryIcon = getCategoryIcon(transaction.category);
  const categoryColor = getCategoryColor(transaction.category);

  return (
    <View className={`flex-row justify-between items-center p-4 rounded-xl mb-4 ${
      isDark ? 'bg-background-card-dark shadow-lg' : 'bg-background-card-light shadow-sm'
    }`}>
      <View className="flex-row items-center flex-1">
        <View className="w-12 h-12 rounded-xl mr-4 justify-center items-center" style={{ backgroundColor: categoryColor + '20' }}>
          <Ionicons name={categoryIcon} size={24} color={categoryColor} />
        </View>
        <View className="flex-1">
          <Text className={`text-base font-semibold mb-1 ${
            isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
          }`} numberOfLines={1}>
            {transaction.description}
          </Text>
          <Text className={`text-sm mb-0.5 ${
            isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'
          }`}>
            {transaction.category} • {formattedDate}
          </Text>
          {transaction.merchant && (
            <Text className={`text-xs ${
              isDark ? 'text-text-tertiary-dark' : 'text-text-tertiary-light'
            }`} numberOfLines={1}>
              {transaction.merchant}
            </Text>
          )}
        </View>
      </View>
      <Text className={`text-lg font-bold ml-4 ${isExpense ? 'text-error' : 'text-success'}`}>
        {isExpense ? '-' : '+'}{formattedAmount}
      </Text>
    </View>
  );
};

// Helper per icone categorie
const getCategoryIcon = (category: string): any => {
  const icons: Record<string, any> = {
    'Food': 'restaurant',
    'Transport': 'car',
    'Shopping': 'cart',
    'Bills': 'receipt',
    'Entertainment': 'game-controller',
    'Health': 'medkit',
    'Income': 'trending-up',
    'Other': 'ellipsis-horizontal'
  };
  return icons[category] || 'ellipsis-horizontal';
};

// Helper per colori categorie
const getCategoryColor = (category: string): string => {
  const categoryColors: Record<string, string> = {
    'Food': '#FF6B6B',
    'Transport': '#4ECDC4',
    'Shopping': '#FFE66D',
    'Bills': '#95E1D3',
    'Entertainment': '#F38181',
    'Health': '#AA96DA',
    'Income': '#10B981',
    'Other': '#95A5A6'
  };
  return categoryColors[category] || categoryColors.Other;
};
