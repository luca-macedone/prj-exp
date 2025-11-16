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
        <Text style={styles.emptyText}>Nessuna transazione</Text>
        <Text style={styles.emptySubtext}>
          Aggiungi la tua prima transazione per iniziare
        </Text>
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

  return (
    <View style={styles.itemContainer}>
      <View style={styles.itemLeft}>
        <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(transaction.category) }]} />
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
    padding: 20
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666'
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
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
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12
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
