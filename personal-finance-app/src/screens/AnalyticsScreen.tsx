/**
 * AnalyticsScreen
 * Schermata con dashboard e grafici analytics
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  TouchableOpacity
} from 'react-native';
import { AnalyticsDashboard } from '../features/analytics';
import { useAnalytics } from '../features/analytics/hooks/useAnalytics';

export const AnalyticsScreen: React.FC = () => {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const { data, loading, error, refreshAnalytics } = useAnalytics(period);

  const periods = [
    { value: 'week' as const, label: 'Settimana' },
    { value: 'month' as const, label: 'Mese' },
    { value: 'year' as const, label: 'Anno' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSubtitle}>
          Panoramica delle tue finanze
        </Text>
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
  periodSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8'
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F5F7FA',
    alignItems: 'center'
  },
  periodButtonSelected: {
    backgroundColor: '#007AFF'
  },
  periodButtonText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500'
  },
  periodButtonTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700'
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
  }
});
