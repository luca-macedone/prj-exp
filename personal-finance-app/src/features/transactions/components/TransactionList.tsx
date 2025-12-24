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
import { colors, spacing, borderRadius } from '../../../theme';

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
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Caricamento transazioni...</Text>
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="wallet-outline" size={80} color={colors.text.tertiary} />
        </View>
        <Text style={styles.emptyText}>Nessuna transazione</Text>
        <Text style={styles.emptySubtext}>
          Inizia a tracciare le tue spese e{'\n'}guadagni per avere il controllo{'\n'}delle tue finanze
        </Text>
        <View style={styles.emptyTips}>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.tipText}>Aggiungi ogni spesa giornaliera</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.tipText}>Categorizza per capire dove spendi</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
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
  return colors.categories[category as keyof typeof colors.categories] || colors.categories.Other;
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.text.secondary
  },
  emptyIconContainer: {
    marginBottom: spacing.xxl
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md
  },
  emptySubtext: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xxxl
  },
  emptyTips: {
    width: '100%',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.xl
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  tipText: {
    marginLeft: spacing.md,
    fontSize: 14,
    color: colors.text.primary,
    flex: 1
  },
  listContainer: {
    padding: spacing.lg
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    ...colors.shadow.sm
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center'
  },
  itemInfo: {
    flex: 1
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4
  },
  metadata: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 2
  },
  merchant: {
    fontSize: 12,
    color: colors.text.tertiary
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: spacing.md
  },
  expense: {
    color: colors.error
  },
  income: {
    color: colors.success
  }
});
