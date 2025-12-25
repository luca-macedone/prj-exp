/**
 * QuickTransactionForm - Form rapido per aggiungere transazioni con Tailwind
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

interface QuickTransactionFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    amount: number;
    description: string;
    category: string;
    merchant?: string;
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

export const QuickTransactionForm: React.FC<QuickTransactionFormProps> = ({
  visible,
  onClose,
  onSubmit
}) => {
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food');
  const [isExpense, setIsExpense] = useState(true);

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount === 0 || !description.trim()) {
      return;
    }

    onSubmit({
      amount: isExpense ? -Math.abs(numAmount) : Math.abs(numAmount),
      description: description.trim(),
      category
    });

    // Reset form
    setAmount('');
    setDescription('');
    setCategory('Food');
    setIsExpense(true);
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
              Nuova Transazione
            </Text>
            <View className="w-10" />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Type Toggle */}
            <View className={`mx-5 mb-6 rounded-xl p-1 ${
              isDark ? 'bg-background-secondary-dark' : 'bg-background-secondary-light'
            }`}>
              <View className="flex-row">
                <TouchableOpacity
                  className={`flex-1 flex-row items-center justify-center py-3 rounded-lg gap-2 ${
                    !isExpense ? (isDark ? 'bg-background-card-dark' : 'bg-background-card-light') : ''
                  }`}
                  onPress={() => setIsExpense(false)}
                >
                  <Ionicons
                    name="arrow-down"
                    size={20}
                    color={!isExpense ? '#10B981' : (isDark ? '#9CA3AF' : '#6B7280')}
                  />
                  <Text className={`text-base font-semibold ${
                    !isExpense ? 'text-success font-bold' : (isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light')
                  }`}>
                    Entrata
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-1 flex-row items-center justify-center py-3 rounded-lg gap-2 ${
                    isExpense ? (isDark ? 'bg-background-card-dark' : 'bg-background-card-light') : ''
                  }`}
                  onPress={() => setIsExpense(true)}
                >
                  <Ionicons
                    name="arrow-up"
                    size={20}
                    color={isExpense ? '#EF4444' : (isDark ? '#9CA3AF' : '#6B7280')}
                  />
                  <Text className={`text-base font-semibold ${
                    isExpense ? 'text-error font-bold' : (isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light')
                  }`}>
                    Uscita
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Amount Input */}
            <View className="flex-row items-center justify-center px-5 mb-8">
              <Text className={`text-5xl font-light mr-2 ${
                isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'
              }`}>
                €
              </Text>
              <TextInput
                className={`text-6xl font-bold min-w-[120px] ${
                  isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
                }`}
                value={amount}
                onChangeText={setAmount}
                placeholder="0,00"
                placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>

            {/* Description Input */}
            <View className="px-5 mb-6">
              <Text className={`text-sm font-semibold mb-2 ${
                isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'
              }`}>
                Descrizione
              </Text>
              <TextInput
                className={`rounded-xl px-5 py-3.5 text-base ${
                  isDark
                    ? 'bg-background-secondary-dark text-text-primary-dark'
                    : 'bg-background-secondary-light text-text-primary-light'
                }`}
                value={description}
                onChangeText={setDescription}
                placeholder="Es: Spesa supermercato"
                placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
                returnKeyType="done"
              />
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
          </ScrollView>

          {/* Submit Button */}
          <TouchableOpacity
            className={`mx-5 mt-5 bg-primary py-4 rounded-xl items-center ${
              (!amount || !description) ? 'opacity-50' : ''
            }`}
            onPress={handleSubmit}
            disabled={!amount || !description}
          >
            <Text className="text-white text-lg font-bold">
              Aggiungi Transazione
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
