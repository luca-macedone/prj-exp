/**
 * BudgetScreen
 * Schermata per visualizzare e gestire budget
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Button,
  Alert,
  Modal,
  TextInput,
  Text,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { BudgetList } from '../features/budget';
import { useBudgets } from '../features/budget/hooks/useBudgets';

export const BudgetScreen: React.FC = () => {
  const {
    budgets,
    loading,
    error,
    addBudget,
    refreshBudgets,
    getBudgetStatus
  } = useBudgets();

  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Food',
    limit: '',
    period: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly'
  });

  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'];
  const periods = [
    { value: 'daily', label: 'Giornaliero' },
    { value: 'weekly', label: 'Settimanale' },
    { value: 'monthly', label: 'Mensile' },
    { value: 'yearly', label: 'Annuale' }
  ];

  const handleAddBudget = async () => {
    try {
      const limit = parseFloat(formData.limit);

      if (isNaN(limit) || limit <= 0) {
        Alert.alert('Errore', 'Inserisci un limite valido');
        return;
      }

      const result = await addBudget({
        category: formData.category,
        limit,
        period: formData.period,
        startDate: Date.now()
      });

      if (result) {
        Alert.alert('Successo', 'Budget creato!');
        setModalVisible(false);
        setFormData({
          category: 'Food',
          limit: '',
          period: 'monthly'
        });
      }
    } catch (err) {
      Alert.alert('Errore', 'Impossibile creare budget');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Budget</Text>
        <Text style={styles.headerSubtitle}>
          {budgets.length} budget attivi
        </Text>
      </View>

      {/* Add Button */}
      <View style={styles.addButtonContainer}>
        <Button
          title="+ Nuovo Budget"
          onPress={() => setModalVisible(true)}
          color="#007AFF"
        />
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Budget List */}
      <BudgetList
        budgets={budgets}
        loading={loading}
        onRefresh={refreshBudgets}
        getBudgetStatus={getBudgetStatus}
        onBudgetPress={(budget) => {
          const status = getBudgetStatus(budget);
          Alert.alert(
            `Budget ${budget.category}`,
            `Speso: ${status.spent.toFixed(2)}€\nLimite: ${status.limit.toFixed(2)}€\nRimanente: ${status.remaining.toFixed(2)}€`
          );
        }}
      />

      {/* Add Budget Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nuovo Budget</Text>

            <ScrollView>
              <Text style={styles.label}>Categoria:</Text>
              <View style={styles.categoryContainer}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.chip,
                      formData.category === cat && styles.chipSelected
                    ]}
                    onPress={() => setFormData({ ...formData, category: cat })}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        formData.category === cat && styles.chipTextSelected
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.input}
                placeholder="Limite (€)"
                value={formData.limit}
                onChangeText={(text) => setFormData({ ...formData, limit: text })}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Periodo:</Text>
              <View style={styles.categoryContainer}>
                {periods.map((p) => (
                  <TouchableOpacity
                    key={p.value}
                    style={[
                      styles.chip,
                      formData.period === p.value && styles.chipSelected
                    ]}
                    onPress={() => setFormData({ ...formData, period: p.value as any })}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        formData.period === p.value && styles.chipTextSelected
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <Button title="Annulla" onPress={() => setModalVisible(false)} color="#999" />
              <View style={{ width: 16 }} />
              <Button title="Crea" onPress={handleAddBudget} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA'
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50'
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4
  },
  addButtonContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8'
  },
  errorContainer: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    margin: 16,
    borderRadius: 8
  },
  errorText: {
    color: '#856404',
    textAlign: 'center'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    maxHeight: '80%'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 20
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20
  },
  chip: {
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8
  },
  chipSelected: {
    backgroundColor: '#007AFF'
  },
  chipText: {
    color: '#2C3E50',
    fontSize: 14
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20
  }
});
