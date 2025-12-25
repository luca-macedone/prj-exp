/**
 * NotificationsScreen - Centro notifiche
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
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
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

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
        return { name: 'wallet', color: '#F59E0B' };
      case 'transaction':
        return { name: 'swap-horizontal', color: '#007AFF' };
      case 'warning':
        return { name: 'alert-circle', color: '#EF4444' };
      default:
        return { name: 'information-circle', color: '#3B82F6' };
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

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-background-primary-dark' : 'bg-background-primary-light'}`}
      edges={['top', 'left', 'right']}
    >
      {/* Header */}
      <View className={`flex-row items-center justify-between px-4 py-3 border-b ${
        isDark ? 'border-border-dark' : 'border-border-light'
      }`}>
        <TouchableOpacity
          onPress={onClose}
          className={`w-10 h-10 rounded-xl items-center justify-center ${
            isDark ? 'bg-background-secondary-dark' : 'bg-background-secondary-light'
          }`}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDark ? '#FFFFFF' : '#1A202C'}
          />
        </TouchableOpacity>

        <View className="flex-1 flex-row items-center justify-center gap-2">
          <Text className={`text-xl font-bold ${
            isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
          }`}>
            Notifiche
          </Text>
          {unreadCount > 0 && (
            <View className="bg-error rounded-full px-2 py-0.5 min-w-6 items-center">
              <Text className="text-xs font-bold text-white">
                {unreadCount}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          className={`w-10 h-10 rounded-xl items-center justify-center ${
            isDark ? 'bg-background-secondary-dark' : 'bg-background-secondary-light'
          }`}
        >
          <Ionicons
            name="checkmark-done"
            size={24}
            color={isDark ? '#A0AEC0' : '#4A5568'}
          />
        </TouchableOpacity>
      </View>

      {/* Filtri */}
      <View className="flex-row gap-2 px-4 py-3">
        <TouchableOpacity
          className={`flex-1 py-3 px-4 rounded-xl items-center ${
            filter === 'all'
              ? 'bg-primary'
              : isDark
                ? 'bg-background-secondary-dark'
                : 'bg-background-secondary-light shadow-sm'
          }`}
          onPress={() => setFilter('all')}
        >
          <Text className={`text-sm font-semibold ${
            filter === 'all'
              ? 'text-white'
              : isDark
                ? 'text-text-secondary-dark'
                : 'text-text-secondary-light'
          }`}>
            Tutte ({notifications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-3 px-4 rounded-xl items-center ${
            filter === 'unread'
              ? 'bg-primary'
              : isDark
                ? 'bg-background-secondary-dark'
                : 'bg-background-secondary-light shadow-sm'
          }`}
          onPress={() => setFilter('unread')}
        >
          <Text className={`text-sm font-semibold ${
            filter === 'unread'
              ? 'text-white'
              : isDark
                ? 'text-text-secondary-dark'
                : 'text-text-secondary-light'
          }`}>
            Non lette ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista notifiche */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredNotifications.length === 0 ? (
          <View className="flex-1 items-center justify-center py-24">
            <Ionicons
              name="notifications-off-outline"
              size={64}
              color="#718096"
            />
            <Text className={`text-xl font-bold mt-4 mb-1 ${
              isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
            }`}>
              Nessuna notifica
            </Text>
            <Text className={`text-sm ${
              isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'
            }`}>
              {filter === 'unread' ? 'Hai letto tutto!' : 'Non hai ancora notifiche'}
            </Text>
          </View>
        ) : (
          <View className="px-4 gap-2">
            {filteredNotifications.map((notif) => {
              const icon = getNotificationIcon(notif.type);
              return (
                <TouchableOpacity
                  key={notif.id}
                  className={`flex-row p-4 rounded-xl ${
                    isDark ? 'bg-background-card-dark' : 'bg-background-card-light shadow-sm'
                  } ${!notif.read ? 'border-l-4 border-l-primary' : ''}`}
                >
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: icon.color + '20' }}
                  >
                    <Ionicons name={icon.name as any} size={24} color={icon.color} />
                  </View>

                  <View className="flex-1">
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className={`flex-1 text-base font-bold ${
                        isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
                      }`}>
                        {notif.title}
                      </Text>
                      <Text className="text-xs text-text-tertiary-light ml-2">
                        {formatTime(notif.timestamp)}
                      </Text>
                    </View>
                    <Text className={`text-sm leading-5 ${
                      isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'
                    }`}>
                      {notif.message}
                    </Text>
                  </View>

                  {!notif.read && (
                    <View className="w-2 h-2 rounded-full bg-primary ml-2 self-center" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};
