/**
 * SettingsScreen - Schermata impostazioni
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';

export const SettingsScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { mode, setMode, theme } = useTheme();
  const { resetDatabase, seedDatabase } = useData();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [monthlyReport, setMonthlyReport] = useState(false);

  // Usa i colori dal tema corrente
  const colors = theme.colors;
  const spacing = theme.spacing;
  const borderRadius = theme.borderRadius;

  const handleThemeChange = (newMode: 'light' | 'dark' | 'system') => {
    setMode(newMode);
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset Dati',
      'Sei sicuro di voler cancellare tutti i dati? Questa azione è irreversibile!',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetDatabase();
            Alert.alert('✅ Completato', 'Tutti i dati sono stati cancellati');
          }
        }
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert('Info', 'Funzione di export in sviluppo');
  };

  const styles = createStyles(colors, spacing, borderRadius);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Impostazioni</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Aspetto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aspetto</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="color-palette" size={22} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Tema</Text>
              <Text style={styles.settingDescription}>Scegli il tema dell'app</Text>
            </View>
          </View>

          <View style={styles.themeOptions}>
            <TouchableOpacity
              style={[styles.themeOption, mode === 'light' && styles.themeOptionActive]}
              onPress={() => handleThemeChange('light')}
            >
              <Ionicons
                name="sunny"
                size={24}
                color={mode === 'light' ? colors.primary : colors.text.secondary}
              />
              <Text style={[
                styles.themeOptionText,
                mode === 'light' && styles.themeOptionTextActive
              ]}>
                Chiaro
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.themeOption, mode === 'dark' && styles.themeOptionActive]}
              onPress={() => handleThemeChange('dark')}
            >
              <Ionicons
                name="moon"
                size={24}
                color={mode === 'dark' ? colors.primary : colors.text.secondary}
              />
              <Text style={[
                styles.themeOptionText,
                mode === 'dark' && styles.themeOptionTextActive
              ]}>
                Scuro
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.themeOption, mode === 'system' && styles.themeOptionActive]}
              onPress={() => handleThemeChange('system')}
            >
              <Ionicons
                name="phone-portrait"
                size={24}
                color={mode === 'system' ? colors.primary : colors.text.secondary}
              />
              <Text style={[
                styles.themeOptionText,
                mode === 'system' && styles.themeOptionTextActive
              ]}>
                Sistema
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifiche */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifiche</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="notifications" size={22} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Notifiche Push</Text>
              <Text style={styles.settingDescription}>
                Ricevi notifiche sull'app
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.background.secondary, true: colors.primary + '60' }}
              thumbColor={notificationsEnabled ? colors.primary : colors.text.tertiary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="warning" size={22} color={colors.warning} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Avvisi Budget</Text>
              <Text style={styles.settingDescription}>
                Avvisa quando superi l'80% del budget
              </Text>
            </View>
            <Switch
              value={budgetAlerts}
              onValueChange={setBudgetAlerts}
              trackColor={{ false: colors.background.secondary, true: colors.primary + '60' }}
              thumbColor={budgetAlerts ? colors.primary : colors.text.tertiary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="calendar" size={22} color={colors.success} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Report Mensile</Text>
              <Text style={styles.settingDescription}>
                Ricevi un riepilogo a fine mese
              </Text>
            </View>
            <Switch
              value={monthlyReport}
              onValueChange={setMonthlyReport}
              trackColor={{ false: colors.background.secondary, true: colors.primary + '60' }}
              thumbColor={monthlyReport ? colors.primary : colors.text.tertiary}
            />
          </View>
        </View>

        {/* Sicurezza */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sicurezza & Privacy</Text>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="lock-closed" size={22} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Cambia PIN</Text>
              <Text style={styles.settingDescription}>
                Modifica il PIN di accesso
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="finger-print" size={22} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Biometria</Text>
              <Text style={styles.settingDescription}>
                Face ID / Touch ID
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>
        </View>

        {/* Dati */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gestione Dati</Text>

          <TouchableOpacity style={styles.settingItem} onPress={handleExportData}>
            <View style={styles.settingIcon}>
              <Ionicons name="cloud-download" size={22} color={colors.success} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Esporta Dati</Text>
              <Text style={styles.settingDescription}>
                Scarica i tuoi dati in CSV/JSON
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleResetData}>
            <View style={styles.settingIcon}>
              <Ionicons name="trash" size={22} color={colors.error} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Reset Dati</Text>
              <Text style={styles.settingDescription}>
                Cancella tutti i dati
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informazioni</Text>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="information-circle" size={22} color={colors.info} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Versione App</Text>
              <Text style={styles.settingDescription}>1.0.0 (Build 1)</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="help-circle" size={22} color={colors.info} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Aiuto & Supporto</Text>
              <Text style={styles.settingDescription}>
                FAQ e assistenza
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="document-text" size={22} color={colors.info} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Privacy Policy</Text>
              <Text style={styles.settingDescription}>
                Termini e condizioni
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>
        </View>

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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary
  },
  section: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    ...colors.shadow.sm
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md
  },
  settingContent: {
    flex: 1
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2
  },
  settingDescription: {
    fontSize: 13,
    color: colors.text.secondary
  },
  themeOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  themeOption: {
    flex: 1,
    backgroundColor: colors.background.card,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
    ...colors.shadow.sm
  },
  themeOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10'
  },
  themeOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary
  },
  themeOptionTextActive: {
    color: colors.primary
  }
});
