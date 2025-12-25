/**
 * NotificationsScreen - Centro notifiche
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';

interface Notification {
  id: string;
  type: 'budget' | 'transaction' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export const NotificationsScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { budgets, transactions } = useData();
  const { theme } = useTheme();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Usa i colori dal tema corrente
  const colors = theme.colors;
  const spacing = theme.spacing;
  const borderRadius = theme.borderRadius;

  // Genera notifiche basate sui dati reali
  const notifications = useMemo((): Notification[] => {
    const notifs: Notification[] = [];

    // Notifiche budget
    budgets.forEach((budget) => {
      const spent = budget.spent || 0;
      const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;

      if (percentage >= 100) {
        notifs.push({
          id: `budget-exceeded-${budget.id}`,
          type: 'warning',
          title: `Budget ${budget.category} superato!`,
          message: `Hai speso €${spent.toFixed(2)} su €${budget.limit.toFixed(2)}`,
          timestamp: Date.now() - Math.random() * 86400000,
          read: Math.random() > 0.3
        });
      } else if (percentage >= 80) {
        notifs.push({
          id: `budget-warning-${budget.id}`,
          type: 'budget',
          title: `Budget ${budget.category} in esaurimento`,
          message: `Hai usato il ${percentage.toFixed(0)}% del budget`,
          timestamp: Date.now() - Math.random() * 86400000,
          read: Math.random() > 0.5
        });
      }
    });

    // Notifiche transazioni recenti
    const recentTransactions = transactions
      .filter(t => Date.now() - t.date < 24 * 60 * 60 * 1000)
      .slice(0, 3);

    recentTransactions.forEach((tx) => {
      if (Math.abs(tx.amount) > 100) {
        notifs.push({
          id: `transaction-${tx.id}`,
          type: 'transaction',
          title: tx.amount > 0 ? 'Entrata registrata' : 'Spesa importante',
          message: `${tx.description}: €${Math.abs(tx.amount).toFixed(2)}`,
          timestamp: tx.date,
          read: Math.random() > 0.4
        });
      }
    });

    // Notifica info generale
    notifs.push({
      id: 'welcome',
      type: 'info',
      title: 'Benvenuto! 👋',
      message: 'Inizia a tracciare le tue finanze per avere statistiche dettagliate',
      timestamp: Date.now() - 2 * 86400000,
      read: true
    });

    return notifs.sort((a, b) => b.timestamp - a.timestamp);
  }, [budgets, transactions]);

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => !n.read);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'budget':
        return { name: 'wallet', color: colors.warning };
      case 'transaction':
        return { name: 'swap-horizontal', color: colors.primary };
      case 'warning':
        return { name: 'alert-circle', color: colors.error };
      default:
        return { name: 'information-circle', color: colors.info };
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}g fa`;
    if (hours > 0) return `${hours}h fa`;
    return 'Ora';
  };

  const styles = createStyles(colors, spacing, borderRadius);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Notifiche</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="checkmark-done" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Filtri */}
      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[
            styles.filterButtonText,
            filter === 'all' && styles.filterButtonTextActive
          ]}>
            Tutte ({notifications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'unread' && styles.filterButtonActive]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[
            styles.filterButtonText,
            filter === 'unread' && styles.filterButtonTextActive
          ]}>
            Non lette ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista notifiche */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color={colors.text.tertiary} />
            <Text style={styles.emptyTitle}>Nessuna notifica</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'unread' ? 'Hai letto tutto!' : 'Non hai ancora notifiche'}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filteredNotifications.map((notif) => {
              const icon = getNotificationIcon(notif.type);
              return (
                <TouchableOpacity
                  key={notif.id}
                  style={[styles.notificationItem, !notif.read && styles.notificationItemUnread]}
                >
                  <View style={[styles.notificationIcon, { backgroundColor: icon.color + '20' }]}>
                    <Ionicons name={icon.name as any} size={24} color={icon.color} />
                  </View>

                  <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <Text style={styles.notificationTitle}>{notif.title}</Text>
                      <Text style={styles.notificationTime}>{formatTime(notif.timestamp)}</Text>
                    </View>
                    <Text style={styles.notificationMessage}>{notif.message}</Text>
                  </View>

                  {!notif.read && <View style={styles.unreadDot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: any, spacing: any, borderRadius: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary
  },
  badge: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center'
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  filters: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md
  },
  filterButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    alignItems: 'center'
  },
  filterButtonActive: {
    backgroundColor: colors.primary
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary
  },
  filterButtonTextActive: {
    color: '#FFFFFF'
  },
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    ...colors.shadow.sm
  },
  notificationItemUnread: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md
  },
  notificationContent: {
    flex: 1
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  notificationTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary
  },
  notificationTime: {
    fontSize: 12,
    color: colors.text.tertiary
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: spacing.sm,
    alignSelf: 'center'
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl * 2
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.xs
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.text.secondary
  }
});
