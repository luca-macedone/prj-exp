/**
 * AnalyticsScreen
 * Schermata con dashboard e grafici analytics
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AnalyticsDashboard } from '../features/analytics';
import { useAnalytics } from '../features/analytics/hooks/useAnalytics';
import { colors, spacing, borderRadius } from '../theme';

export const AnalyticsScreen: React.FC = () => {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');
  const { data, loading, error, refreshAnalytics } = useAnalytics(period);

  const periods = [
    { value: 'week' as const, label: 'Settimana', icon: 'calendar' },
    { value: 'month' as const, label: 'Mese', icon: 'calendar-outline' },
    { value: 'year' as const, label: 'Anno', icon: 'calendar-number' }
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Analytics</Text>
          <Text style={styles.headerSubtitle}>
            Panoramica delle tue finanze
          </Text>
        </View>
        <TouchableOpacity style={styles.exportButton}>
          <Ionicons name="download-outline" size={20} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {periods.map((p) => (
          <TouchableOpacity
            key={p.value}
            style={[
              styles.periodButton,
              period === p.value && styles.periodButtonSelected
            ]}
            onPress={() => setPeriod(p.value)}
          >
            <Ionicons
              name={p.icon as any}
              size={18}
              color={period === p.value ? colors.primary : colors.text.secondary}
            />
            <Text
              style={[
                styles.periodButtonText,
                period === p.value && styles.periodButtonTextSelected
              ]}
            >
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color={colors.warning} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Dashboard */}
      <AnalyticsDashboard data={data} loading={loading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.text.secondary
  },
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm
  },
  periodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    borderWidth: 1.5,
    borderColor: 'transparent'
  },
  periodButtonSelected: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary
  },
  periodButtonTextSelected: {
    color: colors.primary
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm
  },
  errorText: {
    flex: 1,
    color: colors.warning,
    fontSize: 14
  }
});
