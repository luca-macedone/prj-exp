/**
 * HomeScreen - Dashboard principale
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';
import { useTransactions } from '../features/transactions/hooks/useTransactions';

export const HomeScreen: React.FC = () => {
  const { transactions } = useTransactions();

  // Calcola il saldo totale
  const totalBalance = transactions.reduce((sum, t) => sum + t.amount, 0);

  // Calcola entrate e uscite del mese
  const now = Date.now();
  const monthStart = new Date(new Date(now).setDate(1)).getTime();
  const thisMonthTransactions = transactions.filter(t => t.date >= monthStart);
  const income = thisMonthTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const expenses = Math.abs(thisMonthTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.greeting}>Buongiorno,</Text>
              <Text style={styles.userName}>Marco</Text>
            </View>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="sunny-outline" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <View style={styles.balanceIconWrapper}>
              <Ionicons name="wallet" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Saldo Totale</Text>
              <Text style={styles.accountType}>Tutti i Conti</Text>
            </View>
            <TouchableOpacity style={styles.cardButton}>
              <Ionicons name="card-outline" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.balanceAmount}>{formatCurrency(totalBalance)}</Text>

          <View style={styles.balanceFooter}>
            <View style={styles.changeIndicator}>
              <Ionicons name="trending-up" size={16} color={colors.success} />
              <Text style={styles.changeText}>+5.2%</Text>
            </View>
            <Text style={styles.updateTime}>Aggiornato ora</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#10B98120' }]}>
            <View style={[styles.statIcon, { backgroundColor: colors.success }]}>
              <Ionicons name="arrow-down" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.statLabel}>Entrate</Text>
            <Text style={styles.statAmount}>{formatCurrency(income)}</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#EF444420' }]}>
            <View style={[styles.statIcon, { backgroundColor: colors.error }]}>
              <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.statLabel}>Uscite</Text>
            <Text style={styles.statAmount}>{formatCurrency(expenses)}</Text>
          </View>
        </View>

        {/* Savings Goal Widget */}
        <View style={styles.savingsCard}>
          <View style={styles.savingsHeader}>
            <View style={[styles.savingsIcon, { backgroundColor: colors.success + '30' }]}>
              <Ionicons name="trending-up" size={24} color={colors.success} />
            </View>
            <Text style={styles.savingsTitle}>Obiettivo Risparmio</Text>
            <TouchableOpacity>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.savingsAmount}>
            <Text style={styles.savingsValue}>{formatCurrency(totalBalance)}</Text>
          </View>

          <View style={styles.savingsGoal}>
            <Text style={styles.goalLabel}>Obiettivo</Text>
            <Text style={styles.goalValue}>€5.000</Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(totalBalance / 5000) * 100}%` }]} />
            </View>
          </View>

          <Text style={styles.progressText}>
            {Math.round((totalBalance / 5000) * 100)}% all'obiettivo
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Azioni Rapide</Text>
          </View>

          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="add" size={24} color={colors.primary} />
              </View>
              <Text style={styles.actionLabel}>Aggiungi</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: colors.warning + '20' }]}>
                <Ionicons name="swap-horizontal" size={24} color={colors.warning} />
              </View>
              <Text style={styles.actionLabel}>Trasferisci</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: colors.success + '20' }]}>
                <Ionicons name="stats-chart" size={24} color={colors.success} />
              </View>
              <Text style={styles.actionLabel}>Analizza</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: colors.info + '20' }]}>
                <Ionicons name="settings" size={24} color={colors.info} />
              </View>
              <Text style={styles.actionLabel}>Altro</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions Preview */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transazioni Recenti</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Vedi tutte</Text>
            </TouchableOpacity>
          </View>

          {transactions.slice(0, 3).map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={[styles.transactionIcon, { backgroundColor: colors.categories.Food + '20' }]}>
                <Ionicons name="restaurant" size={20} color={colors.categories.Food} />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionName}>{transaction.description}</Text>
                <Text style={styles.transactionDate}>
                  {new Date(transaction.date).toLocaleDateString('it-IT')}
                </Text>
              </View>
              <Text style={[
                styles.transactionAmount,
                transaction.amount < 0 ? styles.expenseAmount : styles.incomeAmount
              ]}>
                {transaction.amount < 0 ? '-' : '+'}
                {formatCurrency(Math.abs(transaction.amount))}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
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
    paddingBottom: spacing.xl
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md
  },
  greeting: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 2
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary
  },
  headerIcons: {
    flexDirection: 'row',
    gap: spacing.md
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  balanceCard: {
    backgroundColor: colors.background.card,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    ...colors.shadow.md
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg
  },
  balanceIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md
  },
  balanceInfo: {
    flex: 1
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 2
  },
  accountType: {
    fontSize: 12,
    color: colors.text.tertiary
  },
  cardButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md
  },
  balanceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
    marginLeft: 4
  },
  updateTime: {
    fontSize: 12,
    color: colors.text.tertiary
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg
  },
  statCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    ...colors.shadow.sm
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4
  },
  statAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary
  },
  savingsCard: {
    backgroundColor: colors.background.card,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    ...colors.shadow.md
  },
  savingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg
  },
  savingsIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md
  },
  savingsTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary
  },
  savingsAmount: {
    marginBottom: spacing.md
  },
  savingsValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.success
  },
  savingsGoal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md
  },
  goalLabel: {
    fontSize: 14,
    color: colors.text.secondary
  },
  goalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary
  },
  progressContainer: {
    marginBottom: spacing.sm
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.sm,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: borderRadius.sm
  },
  progressText: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center'
  },
  quickActions: {
    marginBottom: spacing.lg
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary
  },
  seeAll: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600'
  },
  actionsGrid: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md
  },
  actionButton: {
    flex: 1,
    alignItems: 'center'
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  actionLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center'
  },
  recentSection: {
    paddingBottom: spacing.xl
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md
  },
  transactionInfo: {
    flex: 1
  },
  transactionName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2
  },
  transactionDate: {
    fontSize: 13,
    color: colors.text.secondary
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700'
  },
  expenseAmount: {
    color: colors.error
  },
  incomeAmount: {
    color: colors.success
  }
});
