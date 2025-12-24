/**
 * QuickTransactionForm - Form rapido per aggiungere transazioni
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../theme';

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
  { name: 'Food', icon: 'restaurant', color: colors.categories.Food },
  { name: 'Transport', icon: 'car', color: colors.categories.Transport },
  { name: 'Shopping', icon: 'cart', color: colors.categories.Shopping },
  { name: 'Bills', icon: 'receipt', color: colors.categories.Bills },
  { name: 'Entertainment', icon: 'game-controller', color: colors.categories.Entertainment },
  { name: 'Health', icon: 'medkit', color: colors.categories.Health },
  { name: 'Other', icon: 'ellipsis-horizontal', color: colors.categories.Other }
];

export const QuickTransactionForm: React.FC<QuickTransactionFormProps> = ({
  visible,
  onClose,
  onSubmit
}) => {
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
        style={styles.container}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
            <Text style={styles.title}>Nuova Transazione</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Type Toggle */}
            <View style={styles.typeToggle}>
              <TouchableOpacity
                style={[styles.typeButton, !isExpense && styles.typeButtonActive]}
                onPress={() => setIsExpense(false)}
              >
                <Ionicons
                  name="arrow-down"
                  size={20}
                  color={!isExpense ? colors.success : colors.text.secondary}
                />
                <Text style={[
                  styles.typeText,
                  !isExpense && { color: colors.success, fontWeight: '700' }
                ]}>
                  Entrata
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeButton, isExpense && styles.typeButtonActive]}
                onPress={() => setIsExpense(true)}
              >
                <Ionicons
                  name="arrow-up"
                  size={20}
                  color={isExpense ? colors.error : colors.text.secondary}
                />
                <Text style={[
                  styles.typeText,
                  isExpense && { color: colors.error, fontWeight: '700' }
                ]}>
                  Uscita
                </Text>
              </TouchableOpacity>
            </View>

            {/* Amount Input */}
            <View style={styles.amountSection}>
              <Text style={styles.currencySymbol}>€</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0,00"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>

            {/* Description Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descrizione</Text>
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="Es: Spesa supermercato"
                placeholderTextColor={colors.text.tertiary}
                returnKeyType="done"
              />
            </View>

            {/* Category Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Categoria</Text>
              <View style={styles.categoriesGrid}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.name}
                    style={[
                      styles.categoryButton,
                      category === cat.name && {
                        backgroundColor: cat.color + '30',
                        borderColor: cat.color
                      }
                    ]}
                    onPress={() => setCategory(cat.name)}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: cat.color + '20' }]}>
                      <Ionicons
                        name={cat.icon as any}
                        size={20}
                        color={cat.color}
                      />
                    </View>
                    <Text style={[
                      styles.categoryText,
                      category === cat.name && { color: colors.text.primary, fontWeight: '600' }
                    ]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!amount || !description) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!amount || !description}
          >
            <Text style={styles.submitButtonText}>Aggiungi Transazione</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay
  },
  content: {
    backgroundColor: colors.background.card,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
    paddingBottom: spacing.xl
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary
  },
  typeToggle: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: 4
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    gap: spacing.sm
  },
  typeButtonActive: {
    backgroundColor: colors.background.card
  },
  typeText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.secondary
  },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xxl
  },
  currencySymbol: {
    fontSize: 48,
    fontWeight: '300',
    color: colors.text.secondary,
    marginRight: spacing.sm
  },
  amountInput: {
    fontSize: 56,
    fontWeight: '700',
    color: colors.text.primary,
    minWidth: 120,
    textAlign: 'left'
  },
  inputGroup: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.sm
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text.primary
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: spacing.sm
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center'
  },
  categoryText: {
    fontSize: 14,
    color: colors.text.secondary
  },
  submitButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...colors.shadow.md
  },
  submitButtonDisabled: {
    opacity: 0.5
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF'
  }
});
