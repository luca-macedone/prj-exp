/**
 * TransactionsScreen
 * Schermata principale per visualizzare e gestire transazioni
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TransactionList } from '../features/transactions';
import { useTransactions } from '../features/transactions/hooks/useTransactions';
import { QuickTransactionForm } from '../components/QuickTransactionForm';
import { colors, spacing, borderRadius } from '../theme';

export const TransactionsScreen: React.FC = () => {
  const {
    transactions,
    loading,
    error,
    addTransaction,
    refreshTransactions
  } = useTransactions();

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
      }
    } catch (err) {
      console.error('Errore aggiunta transazione:', err);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Transazioni</Text>
          <Text style={styles.headerSubtitle}>
            {transactions.length} totali
          </Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={20} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add-circle" size={24} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Nuova Transazione</Text>
      </TouchableOpacity>

      {/* Error */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color={colors.warning} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Transactions List */}
      <TransactionList
        transactions={transactions}
        loading={loading}
        onRefresh={refreshTransactions}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.text.secondary
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    ...colors.shadow.md
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm
  },
  errorText: {
    flex: 1,
    color: colors.warning,
    fontSize: 14
  }
});
