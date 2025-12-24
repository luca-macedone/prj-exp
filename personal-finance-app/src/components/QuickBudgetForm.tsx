/**
 * QuickBudgetForm - Form rapido per creare budget
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
  { name: 'Food', icon: 'restaurant', color: colors.categories.Food },
  { name: 'Transport', icon: 'car', color: colors.categories.Transport },
  { name: 'Shopping', icon: 'cart', color: colors.categories.Shopping },
  { name: 'Bills', icon: 'receipt', color: colors.categories.Bills },
  { name: 'Entertainment', icon: 'game-controller', color: colors.categories.Entertainment },
  { name: 'Health', icon: 'medkit', color: colors.categories.Health },
  { name: 'Other', icon: 'ellipsis-horizontal', color: colors.categories.Other }
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
            <Text style={styles.title}>Nuovo Budget</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Limit Input */}
            <View style={styles.limitSection}>
              <Text style={styles.limitLabel}>Limite mensile</Text>
              <View style={styles.limitInputContainer}>
                <Text style={styles.currencySymbol}>€</Text>
                <TextInput
                  style={styles.limitInput}
                  value={limit}
                  onChangeText={setLimit}
                  placeholder="0,00"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="decimal-pad"
                  autoFocus
                />
              </View>
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

            {/* Period Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Periodo</Text>
              <View style={styles.periodsGrid}>
                {PERIODS.map((p) => (
                  <TouchableOpacity
                    key={p.value}
                    style={[
                      styles.periodButton,
                      period === p.value && styles.periodButtonActive
                    ]}
                    onPress={() => setPeriod(p.value)}
                  >
                    <Ionicons
                      name={p.icon as any}
                      size={24}
                      color={period === p.value ? colors.primary : colors.text.secondary}
                    />
                    <Text style={[
                      styles.periodText,
                      period === p.value && styles.periodTextActive
                    ]}>
                      {p.label}
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
              !limit && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!limit}
          >
            <Text style={styles.submitButtonText}>Crea Budget</Text>
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
  limitSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xxl
  },
  limitLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.md
  },
  limitInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  currencySymbol: {
    fontSize: 48,
    fontWeight: '300',
    color: colors.text.secondary,
    marginRight: spacing.sm
  },
  limitInput: {
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
  periodsGrid: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  periodButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  periodButtonActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary
  },
  periodText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
    marginTop: spacing.xs
  },
  periodTextActive: {
    color: colors.primary
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
