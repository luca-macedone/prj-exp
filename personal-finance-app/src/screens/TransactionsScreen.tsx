/**
 * TransactionsScreen
 * Schermata principale per visualizzare e gestire transazioni
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
import { TransactionList } from '../features/transactions';
import { useTransactions } from '../features/transactions/hooks/useTransactions';
import SecureDatabase from '../services/storage/SecureDatabase';

export const TransactionsScreen: React.FC = () => {
  const {
    transactions,
    loading,
    error,
    addTransaction,
    refreshTransactions
  } = useTransactions();

  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Other',
    merchant: ''
  });

  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'];

  const handleAddTransaction = async () => {
    try {
      const amount = parseFloat(formData.amount);

      if (isNaN(amount) || amount === 0) {
        Alert.alert('Errore', 'Inserisci un importo valido');
        return;
      }

      if (!formData.description.trim()) {
        Alert.alert('Errore', 'Inserisci una descrizione');
        return;
      }

      const result = await addTransaction({
        amount,
        description: formData.description,
        category: formData.category,
        date: Date.now(),
        accountId: 'default-account',
        merchant: formData.merchant || undefined
      });

      if (result) {
        Alert.alert('Successo', 'Transazione aggiunta!');
        setModalVisible(false);
        setFormData({
          description: '',
          amount: '',
          category: 'Other',
          merchant: ''
        });
      }
    } catch (err) {
      Alert.alert('Errore', 'Impossibile aggiungere transazione');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transazioni</Text>
        <Text style={styles.headerSubtitle}>
          {transactions.length} totali
        </Text>
      </View>

      {/* Add Button */}
      <View style={styles.addButtonContainer}>
        <Button
          title="+ Nuova Transazione"
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

      {/* Transactions List */}
      <TransactionList
        transactions={transactions}
        loading={loading}
        onRefresh={refreshTransactions}
        onTransactionPress={(transaction) => {
          Alert.alert(
            'Dettagli',
            `${transaction.description}\n${transaction.amount}€\n${transaction.category}`
          );
        }}
      />

      {/* Add Transaction Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nuova Transazione</Text>

            <ScrollView>
              <TextInput
                style={styles.input}
                placeholder="Descrizione"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
              />

              <TextInput
                style={styles.input}
                placeholder="Importo (usa - per spese)"
                value={formData.amount}
                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                keyboardType="numeric"
              />

              <TextInput
                style={styles.input}
                placeholder="Commerciante (opzionale)"
                value={formData.merchant}
                onChangeText={(text) => setFormData({ ...formData, merchant: text })}
              />

              <Text style={styles.label}>Categoria:</Text>
              <View style={styles.categoryContainer}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      formData.category === cat && styles.categoryChipSelected
                    ]}
                    onPress={() => setFormData({ ...formData, category: cat })}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        formData.category === cat && styles.categoryChipTextSelected
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <Button title="Annulla" onPress={() => setModalVisible(false)} color="#999" />
              <View style={{ width: 16 }} />
              <Button title="Aggiungi" onPress={handleAddTransaction} />
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
  categoryChip: {
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8
  },
  categoryChipSelected: {
    backgroundColor: '#007AFF'
  },
  categoryChipText: {
    color: '#2C3E50',
    fontSize: 14
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20
  }
});
