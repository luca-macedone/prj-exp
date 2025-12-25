/**
 * BudgetScreen
 * Schermata per visualizzare e gestire budget
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
import { BudgetList } from '../features/budget';
import { QuickBudgetForm } from '../components/QuickBudgetForm';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';

export const BudgetScreen: React.FC = () => {
  const {
    budgets,
    loading,
    addBudget,
    refreshData,
    transactions
  } = useData();

  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Calcola lo stato di un budget
  const getBudgetStatus = (budget: any) => {
    if (!budget) {
      return {
        spent: 0,
        limit: 0,
        remaining: 0,
        percentage: 0,
        isOverBudget: false,
        isWarning: false
      };
    }

    const spent = budget.spent || 0;
    const limit = budget.limit || 0;
    const remaining = limit - spent;
    const percentage = limit > 0 ? (spent / limit) * 100 : 0;
    const isOverBudget = percentage >= 100;
    const isWarning = percentage >= 80 && !isOverBudget;

    return {
      spent,
      limit,
      remaining,
      percentage,
      isOverBudget,
      isWarning
    };
  };

  const handleAddBudget = async (data: {
    category: string;
    limit: number;
    period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  }) => {
    try {
      const result = await addBudget({
        category: data.category,
        limit: data.limit,
        period: data.period,
        startDate: Date.now()
      });

      if (result) {
        setModalVisible(false);
        Toast.show({
          type: 'success',
          text1: 'Budget creato!',
          text2: `€${data.limit} per ${data.category}`,
          position: 'bottom',
        });
      }
    } catch (err) {
      console.error('Errore creazione budget:', err);
      Toast.show({
        type: 'error',
        text1: 'Errore',
        text2: 'Impossibile creare il budget',
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
            Budget
          </Text>
          <Text className={`text-sm ${
            isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'
          }`}>
            {budgets.length} budget attivi
          </Text>
        </View>
        <TouchableOpacity
          className={`w-10 h-10 rounded-xl items-center justify-center ${
            isDark ? 'bg-background-secondary-dark' : 'bg-background-secondary-light'
          }`}
        >
          <Ionicons
            name="options"
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
          Nuovo Budget
        </Text>
      </TouchableOpacity>

      {/* Error */}
      {error && (
        <View className="flex-row items-center bg-warning/20 px-4 py-3 mx-4 mb-4 rounded-xl gap-2">
          <Ionicons name="alert-circle" size={20} color="#F59E0B" />
          <Text className="flex-1 text-warning text-sm">{error}</Text>
        </View>
      )}

      {/* Budget List */}
      <BudgetList
        budgets={budgets}
        loading={loading}
        onRefresh={refreshData}
        getBudgetStatus={getBudgetStatus}
        onBudgetPress={(budget) => {
          // TODO: Navigate to budget details
          console.log('Budget pressed:', budget);
        }}
      />

      {/* Quick Budget Form */}
      <QuickBudgetForm
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddBudget}
      />
    </SafeAreaView>
  );
};
