/**
 * DeveloperMenu - Menu sviluppatore per reset e seed database
 * Accessibile con shake gesture o long press in alto a sinistra
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Accelerometer } from 'expo-sensors';
import { colors, spacing, borderRadius } from '../theme';
import { useData } from '../context/DataContext';

export const DeveloperMenu: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const { resetDatabase, seedDatabase, transactions, budgets } = useData();
  const [shakeCount, setShakeCount] = useState(0);

  useEffect(() => {
    let subscription: any;

    // Solo in development mode
    if (__DEV__) {
      Accelerometer.setUpdateInterval(100);

      subscription = Accelerometer.addListener(({ x, y, z }) => {
        const acceleration = Math.sqrt(x * x + y * y + z * z);

        // Detect shake (acceleration > 2.5 G)
        if (acceleration > 2.5) {
          setShakeCount((prev) => {
            const newCount = prev + 1;
            if (newCount >= 3) {
              setVisible(true);
              return 0;
            }
            return newCount;
          });
        }
      });

      // Reset shake count dopo 1 secondo
      const timer = setInterval(() => {
        setShakeCount(0);
      }, 1000);

      return () => {
        subscription?.remove();
        clearInterval(timer);
      };
    }
  }, []);

  const handleReset = () => {
    Alert.alert(
      'Reset Database',
      'Sei sicuro di voler cancellare TUTTI i dati? Questa azione è irreversibile!',
      [
        {
          text: 'Annulla',
          style: 'cancel'
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetDatabase();
            setVisible(false);
            Alert.alert('✅ Database Resettato', 'Il database è stato resettato con successo!');
          }
        }
      ]
    );
  };

  const handleSeed = () => {
    Alert.alert(
      'Seed Database',
      'Vuoi popolare il database con dati di esempio? (15 transazioni e 4 budget)',
      [
        {
          text: 'Annulla',
          style: 'cancel'
        },
        {
          text: 'Seed',
          onPress: async () => {
            await seedDatabase();
            setVisible(false);
            Alert.alert('✅ Database Popolato', 'Il database è stato popolato con dati di esempio!');
          }
        }
      ]
    );
  };

  if (!__DEV__) {
    return null; // Non mostrare in production
  }

  return (
    <>
      {/* Developer Icon - Long press to open */}
      <TouchableOpacity
        style={styles.devIcon}
        onLongPress={() => setVisible(true)}
        delayLongPress={1000}
      >
        <Ionicons name="bug" size={16} color={colors.warning} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.menu}>
            {/* Header */}
            <View style={styles.header}>
              <Ionicons name="construct" size={28} color={colors.primary} />
              <Text style={styles.title}>Developer Tools</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{transactions.length}</Text>
                <Text style={styles.statLabel}>Transazioni</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{budgets.length}</Text>
                <Text style={styles.statLabel}>Budget</Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.seedButton]}
                onPress={handleSeed}
              >
                <Ionicons name="flash" size={24} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Seed Database</Text>
                <Text style={styles.actionButtonSubtext}>
                  Aggiungi dati di esempio
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.resetButton]}
                onPress={handleReset}
              >
                <Ionicons name="trash" size={24} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Reset Database</Text>
                <Text style={styles.actionButtonSubtext}>
                  Cancella tutti i dati
                </Text>
              </TouchableOpacity>
            </View>

            {/* Info */}
            <View style={styles.info}>
              <Ionicons name="information-circle-outline" size={16} color={colors.text.tertiary} />
              <Text style={styles.infoText}>
                {Platform.OS === 'ios' ? 'Shake device' : 'Shake o long press'} per aprire questo menu
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  devIcon: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.warning + '20',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    borderWidth: 1,
    borderColor: colors.warning + '40'
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl
  },
  menu: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...colors.shadow.lg
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.md
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl
  },
  statItem: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center'
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4
  },
  statLabel: {
    fontSize: 13,
    color: colors.text.secondary
  },
  actions: {
    gap: spacing.md,
    marginBottom: spacing.lg
  },
  actionButton: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    gap: spacing.xs
  },
  seedButton: {
    backgroundColor: colors.success
  },
  resetButton: {
    backgroundColor: colors.error
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  actionButtonSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)'
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: borderRadius.sm
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.text.tertiary
  }
});
