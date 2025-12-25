/**
 * QuickBudgetForm - Form rapido per creare budget con Tailwind
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface QuickBudgetFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    category: string;
    limit: number;
    period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  }) => void;
}

const CATEGORIES = [
  { name: 'Food', icon: 'restaurant', color: '#FF6B6B' },
  { name: 'Transport', icon: 'car', color: '#4ECDC4' },
  { name: 'Shopping', icon: 'cart', color: '#FFD93D' },
  { name: 'Bills', icon: 'receipt', color: '#6C5CE7' },
  { name: 'Entertainment', icon: 'game-controller', color: '#FF8787' },
  { name: 'Health', icon: 'medkit', color: '#A8E6CF' },
  { name: 'Other', icon: 'ellipsis-horizontal', color: '#95A5A6' }
];

const PERIODS = [
  { value: 'daily', label: 'Giornaliero', icon: 'today' },
  { value: 'weekly', label: 'Settimanale', icon: 'calendar' },
  { value: 'monthly', label: 'Mensile', icon: 'calendar-outline' },
  { value: 'yearly', label: 'Annuale', icon: 'calendar-number' }
] as const;

export const QuickBudgetForm: React.FC<QuickBudgetFormProps> = ({
  visible,
  onClose,
  onSubmit
}) => {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  const [limit, setLimit] = useState('');
  const [category, setCategory] = useState('Food');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  const handleSubmit = () => {
    const numLimit = parseFloat(limit);
    if (isNaN(numLimit) || numLimit <= 0) {
      return;
    }

    onSubmit({
      category,
      limit: numLimit,
      period
    });

    // Reset form
    setLimit('');
    setCategory('Food');
    setPeriod('monthly');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end"
      >
        <TouchableOpacity
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={onClose}
        />

        <View className={`rounded-t-3xl max-h-[90%] pb-6 ${
          isDark ? 'bg-background-card-dark' : 'bg-background-card-light'
        }`}>
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 pt-6 pb-3">
            <TouchableOpacity
              className={`w-10 h-10 rounded-xl justify-center items-center ${
                isDark ? 'bg-background-secondary-dark' : 'bg-background-secondary-light'
              }`}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={isDark ? '#D1D5DB' : '#6B7280'} />
            </TouchableOpacity>
            <Text className={`text-xl font-bold ${
              isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
            }`}>
              Nuovo Budget
            </Text>
            <View className="w-10" />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Limit Input */}
            <View className="items-center px-5 mb-8">
              <Text className={`text-sm font-semibold mb-3 ${
                isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'
              }`}>
                Limite mensile
              </Text>
              <View className="flex-row items-center justify-center">
                <Text className={`text-5xl font-light mr-2 ${
                  isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'
                }`}>
                  €
                </Text>
                <TextInput
                  className={`text-6xl font-bold min-w-[120px] ${
                    isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
                  }`}
                  value={limit}
                  onChangeText={setLimit}
                  placeholder="0,00"
                  placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
                  keyboardType="decimal-pad"
                  autoFocus
                />
              </View>
            </View>

            {/* Category Selection */}
            <View className="px-5 mb-6">
              <Text className={`text-sm font-semibold mb-2 ${
                isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'
              }`}>
                Categoria
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.name}
                    className={`flex-row items-center px-3 py-2 rounded-xl border-[1.5px] gap-2 ${
                      category === cat.name
                        ? 'border-[${cat.color}]'
                        : 'border-transparent'
                    } ${
                      isDark ? 'bg-background-secondary-dark' : 'bg-background-secondary-light'
                    }`}
                    style={category === cat.name ? {
                      backgroundColor: `${cat.color}30`,
                      borderColor: cat.color
                    } : {}}
                    onPress={() => setCategory(cat.name)}
                  >
                    <View
                      className="w-8 h-8 rounded-lg justify-center items-center"
                      style={{ backgroundColor: `${cat.color}20` }}
                    >
                      <Ionicons
                        name={cat.icon as any}
                        size={20}
                        color={cat.color}
                      />
                    </View>
                    <Text className={`text-sm ${
                      category === cat.name
                        ? isDark ? 'text-text-primary-dark font-semibold' : 'text-text-primary-light font-semibold'
                        : isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'
                    }`}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Period Selection */}
            <View className="px-5 mb-6">
              <Text className={`text-sm font-semibold mb-2 ${
                isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'
              }`}>
                Periodo
              </Text>
              <View className="flex-row gap-2">
                {PERIODS.map((p) => (
                  <TouchableOpacity
                    key={p.value}
                    className={`flex-1 items-center py-4 rounded-xl border-2 ${
                      period === p.value
                        ? 'border-primary'
                        : 'border-transparent'
                    } ${
                      isDark ? 'bg-background-secondary-dark' : 'bg-background-secondary-light'
                    }`}
                    style={period === p.value ? {
                      backgroundColor: '#007AFF20'
                    } : {}}
                    onPress={() => setPeriod(p.value)}
                  >
                    <Ionicons
                      name={p.icon as any}
                      size={24}
                      color={period === p.value ? '#007AFF' : (isDark ? '#9CA3AF' : '#6B7280')}
                    />
                    <Text className={`text-xs font-semibold mt-1 ${
                      period === p.value
                        ? 'text-primary'
                        : isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'
                    }`}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Submit Button */}
          <TouchableOpacity
            className={`mx-5 mt-5 bg-primary py-4 rounded-xl items-center ${
              !limit ? 'opacity-50' : ''
            }`}
            onPress={handleSubmit}
            disabled={!limit}
          >
            <Text className="text-white text-lg font-bold">
              Crea Budget
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
