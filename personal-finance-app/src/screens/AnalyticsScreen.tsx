/**
 * AnalyticsScreen
 * Schermata con dashboard e grafici analytics con filtri avanzati
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AnalyticsDashboard } from '../features/analytics';
import { useAnalytics } from '../features/analytics/hooks/useAnalytics';
import { colors, spacing, borderRadius } from '../theme';
import { useData } from '../context/DataContext';
import dayjs from 'dayjs';

type PeriodType = 'week' | 'month' | 'year' | 'custom';

export const AnalyticsScreen: React.FC = () => {
  const [period, setPeriod] = useState<PeriodType>('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { transactions, loading: dataLoading } = useData();

  // Filtra transazioni per categoria se selezionata
  const filteredTransactions = useMemo(() => {
    if (!selectedCategory) return transactions;
    return transactions.filter(t => t.category === selectedCategory);
  }, [transactions, selectedCategory]);

  // Modifica le transazioni se selezione mese/anno custom
  const customFilteredTransactions = useMemo(() => {
    if (period !== 'custom') return filteredTransactions;

    const startDate = new Date(selectedYear, selectedMonth, 1).getTime();
    const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59).getTime();

    return filteredTransactions.filter(t => t.date >= startDate && t.date <= endDate);
  }, [filteredTransactions, period, selectedMonth, selectedYear]);

  const { data, loading, error } = useAnalytics(
    period === 'custom' ? 'month' : period,
    customFilteredTransactions
  );

  // Ottieni categorie uniche
  const categories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category));
    return ['Tutte', ...Array.from(cats)];
  }, [transactions]);

  // Genera mesi per il selector
  const months = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    setPeriod('custom');
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setPeriod('custom');
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat === 'Tutte' ? null : cat);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCategory) count++;
    if (period === 'custom') count++;
    return count;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Analytics</Text>
          <Text style={styles.headerSubtitle}>
            {period === 'custom'
              ? `${months[selectedMonth]} ${selectedYear}`
              : 'Panoramica delle tue finanze'
            }
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="options" size={20} color={colors.text.secondary} />
            {getActiveFiltersCount() > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="download-outline" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Period Selector */}
      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[
            styles.periodButton,
            period === 'week' && styles.periodButtonSelected
          ]}
          onPress={() => setPeriod('week')}
        >
          <Ionicons
            name="calendar"
            size={18}
            color={period === 'week' ? colors.primary : colors.text.secondary}
          />
          <Text style={[
            styles.periodButtonText,
            period === 'week' && styles.periodButtonTextSelected
          ]}>
            Settimana
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.periodButton,
            (period === 'month' || period === 'custom') && styles.periodButtonSelected
          ]}
          onPress={() => setPeriod('month')}
        >
          <Ionicons
            name="calendar-outline"
            size={18}
            color={(period === 'month' || period === 'custom') ? colors.primary : colors.text.secondary}
          />
          <Text style={[
            styles.periodButtonText,
            (period === 'month' || period === 'custom') && styles.periodButtonTextSelected
          ]}>
            Mese
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.periodButton,
            period === 'year' && styles.periodButtonSelected
          ]}
          onPress={() => setPeriod('year')}
        >
          <Ionicons
            name="calendar-number"
            size={18}
            color={period === 'year' ? colors.primary : colors.text.secondary}
          />
          <Text style={[
            styles.periodButtonText,
            period === 'year' && styles.periodButtonTextSelected
          ]}>
            Anno
          </Text>
        </TouchableOpacity>
      </View>

      {/* Active Filters */}
      {(selectedCategory || period === 'custom') && (
        <View style={styles.activeFilters}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activeFiltersContent}
          >
            {selectedCategory && (
              <View style={styles.filterChip}>
                <Ionicons name="pricetag" size={14} color={colors.primary} />
                <Text style={styles.filterChipText}>{selectedCategory}</Text>
                <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                  <Ionicons name="close-circle" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            )}
            {period === 'custom' && (
              <View style={styles.filterChip}>
                <Ionicons name="calendar" size={14} color={colors.primary} />
                <Text style={styles.filterChipText}>
                  {months[selectedMonth]} {selectedYear}
                </Text>
                <TouchableOpacity onPress={() => setPeriod('month')}>
                  <Ionicons name="close-circle" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* Error */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color={colors.warning} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Dashboard */}
      <AnalyticsDashboard data={data} loading={loading} />

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilters(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'left', 'right', 'bottom']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtri</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowFilters(false)}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Selezione Mese */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Seleziona Mese</Text>
              <View style={styles.monthGrid}>
                {months.map((month, index) => (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.monthButton,
                      selectedMonth === index && period === 'custom' && styles.monthButtonActive
                    ]}
                    onPress={() => handleMonthSelect(index)}
                  >
                    <Text style={[
                      styles.monthButtonText,
                      selectedMonth === index && period === 'custom' && styles.monthButtonTextActive
                    ]}>
                      {month.substring(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Selezione Anno */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Seleziona Anno</Text>
              <View style={styles.yearGrid}>
                {years.map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.yearButton,
                      selectedYear === year && period === 'custom' && styles.yearButtonActive
                    ]}
                    onPress={() => handleYearSelect(year)}
                  >
                    <Text style={[
                      styles.yearButtonText,
                      selectedYear === year && period === 'custom' && styles.yearButtonTextActive
                    ]}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Filtra per Categoria */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Filtra per Categoria</Text>
              <View style={styles.categoryGrid}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryButton,
                      (cat === 'Tutte' ? !selectedCategory : selectedCategory === cat) &&
                        styles.categoryButtonActive
                    ]}
                    onPress={() => handleCategorySelect(cat)}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      (cat === 'Tutte' ? !selectedCategory : selectedCategory === cat) &&
                        styles.categoryButtonTextActive
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ height: spacing.xxxl }} />
          </ScrollView>

          {/* Apply Button */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setPeriod('month');
                setSelectedCategory(null);
                setSelectedMonth(new Date().getMonth());
                setSelectedYear(new Date().getFullYear());
              }}
            >
              <Text style={styles.resetButtonText}>Reset Filtri</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>Applica</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
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
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    borderRadius: borderRadius.full,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
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
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary
  },
  periodButtonTextSelected: {
    color: colors.primary
  },
  activeFilters: {
    paddingBottom: spacing.md
  },
  activeFiltersContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
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
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.primary
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  filterSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  monthButton: {
    width: '22%',
    paddingVertical: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent'
  },
  monthButtonActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary
  },
  monthButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary
  },
  monthButtonTextActive: {
    color: colors.primary
  },
  yearGrid: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  yearButton: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent'
  },
  yearButtonActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary
  },
  yearButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.secondary
  },
  yearButtonTextActive: {
    color: colors.primary
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  categoryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: 'transparent'
  },
  categoryButtonActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary
  },
  categoryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary
  },
  categoryButtonTextActive: {
    color: colors.primary
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.background.secondary
  },
  resetButton: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    alignItems: 'center'
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary
  },
  applyButton: {
    flex: 2,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    alignItems: 'center'
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF'
  }
});
