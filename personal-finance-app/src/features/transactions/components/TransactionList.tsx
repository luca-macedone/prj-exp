/**
 * TransactionList Component
 * Visualizza lista di transazioni con performance ottimizzate
 */

import React from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../../../types';

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
    />
  );

  const keyExtractor = (item: Transaction) => item.id;

  if (loading && transactions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Caricamento transazioni...</Text>
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="wallet-outline" size={80} color="#CBD5E0" />
        </View>
        <Text style={styles.emptyText}>Nessuna transazione</Text>
        <Text style={styles.emptySubtext}>
          Inizia a tracciare le tue spese e{'\n'}guadagni per avere il controllo{'\n'}delle tue finanze
        </Text>
        <View style={styles.emptyTips}>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
            <Text style={styles.tipText}>Aggiungi ogni spesa giornaliera</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
            <Text style={styles.tipText}>Categorizza per capire dove spendi</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
            <Text style={styles.tipText}>Monitora i tuoi progressi</Text>
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
      contentContainerStyle={styles.listContainer}
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
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onPress }) => {
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
    <View style={styles.itemContainer}>
      <View style={styles.itemLeft}>
        <View style={[styles.categoryIcon, { backgroundColor: categoryColor + '20' }]}>
          <Ionicons name={categoryIcon} size={24} color={categoryColor} />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.description} numberOfLines={1}>
            {transaction.description}
          </Text>
          <Text style={styles.metadata}>
            {transaction.category} • {formattedDate}
          </Text>
          {transaction.merchant && (
            <Text style={styles.merchant} numberOfLines={1}>
              {transaction.merchant}
            </Text>
          )}
        </View>
      </View>
      <Text style={[styles.amount, isExpense ? styles.expense : styles.income]}>
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
  const colors: Record<string, string> = {
    'Food': '#FF6B6B',
    'Transport': '#4ECDC4',
    'Shopping': '#FFD93D',
    'Bills': '#6C5CE7',
    'Entertainment': '#FF8787',
    'Health': '#A8E6CF',
    'Income': '#4CAF50',
  };
  return colors[category] || '#95A5A6';
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666'
  },
  emptyIconContainer: {
    marginBottom: 24
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12
  },
  emptySubtext: {
    fontSize: 15,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32
  },
  emptyTips: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  tipText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#2C3E50',
    flex: 1
  },
  listContainer: {
    padding: 16
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  itemInfo: {
    flex: 1
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  metadata: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2
  },
  merchant: {
    fontSize: 12,
    color: '#999'
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12
  },
  expense: {
    color: '#E74C3C'
  },
  income: {
    color: '#27AE60'
  }
});
