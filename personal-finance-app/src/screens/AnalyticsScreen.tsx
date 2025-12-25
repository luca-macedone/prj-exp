/**
 * AnalyticsScreen
 * Schermata con dashboard e grafici analytics con filtri avanzati
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AnalyticsDashboard } from '../features/analytics';
import { useAnalytics } from '../features/analytics/hooks/useAnalytics';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';

type PeriodType = 'week' | 'month' | 'year' | 'custom';
type TransactionType = 'all' | 'income' | 'expense';

export const AnalyticsScreen: React.FC = () => {
  const [period, setPeriod] = useState<PeriodType>('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<TransactionType>('all');
  const [minAmount, setMinAmount] = useState<number | null>(null);
  const [maxAmount, setMaxAmount] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { transactions, loading: dataLoading } = useData();
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  // Filtra transazioni per categoria, tipo e importo
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filtro per categoria
    if (selectedCategory) {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Filtro per tipo (income/expense)
    if (selectedType !== 'all') {
      filtered = filtered.filter(t =>
        selectedType === 'income' ? t.type === 'income' : t.type === 'expense'
      );
    }

    // Filtro per importo minimo
    if (minAmount !== null) {
      filtered = filtered.filter(t => Math.abs(t.amount) >= minAmount);
    }

    // Filtro per importo massimo
    if (maxAmount !== null) {
      filtered = filtered.filter(t => Math.abs(t.amount) <= maxAmount);
    }

    return filtered;
  }, [transactions, selectedCategory, selectedType, minAmount, maxAmount]);

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
    if (selectedType !== 'all') count++;
    if (minAmount !== null) count++;
    if (maxAmount !== null) count++;
    return count;
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-background-primary-dark' : 'bg-background-primary-light'}`}
      edges={['top', 'left', 'right']}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 pt-3 pb-4">
        <View>
          <Text className={`text-3xl font-bold mb-1 ${
            isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
          }`}>
            Analytics
          </Text>
          <Text className={`text-sm ${
            isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'
          }`}>
            {period === 'custom'
              ? `${months[selectedMonth]} ${selectedYear}`
              : 'Panoramica delle tue finanze'
            }
          </Text>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity
            className={`w-10 h-10 rounded-xl items-center justify-center relative ${
              isDark ? 'bg-background-secondary-dark' : 'bg-background-secondary-light'
            }`}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons
              name="options"
              size={20}
              color={isDark ? '#A0AEC0' : '#4A5568'}
            />
            {getActiveFiltersCount() > 0 && (
              <View className="absolute -top-1 -right-1 bg-error rounded-full w-4.5 h-4.5 items-center justify-center">
                <Text className="text-[10px] font-bold text-white">
                  {getActiveFiltersCount()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            className={`w-10 h-10 rounded-xl items-center justify-center ${
              isDark ? 'bg-background-secondary-dark' : 'bg-background-secondary-light'
            }`}
          >
            <Ionicons
              name="download-outline"
              size={20}
              color={isDark ? '#A0AEC0' : '#4A5568'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Period Selector */}
      <View className="flex-row px-4 pb-3 gap-2">
        <TouchableOpacity
          className={`flex-1 flex-row items-center justify-center gap-1 py-3 rounded-xl border-[1.5px] ${
            period === 'week'
              ? 'bg-primary/20 border-primary'
              : isDark
                ? 'bg-background-secondary-dark border-transparent'
                : 'bg-background-secondary-light border-transparent'
          }`}
          onPress={() => setPeriod('week')}
        >
          <Ionicons
            name="calendar"
            size={18}
            color={period === 'week' ? '#007AFF' : (isDark ? '#A0AEC0' : '#4A5568')}
          />
          <Text className={`text-[13px] font-semibold ${
            period === 'week'
              ? 'text-primary'
              : isDark
                ? 'text-text-secondary-dark'
                : 'text-text-secondary-light'
          }`}>
            Settimana
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 flex-row items-center justify-center gap-1 py-3 rounded-xl border-[1.5px] ${
            (period === 'month' || period === 'custom')
              ? 'bg-primary/20 border-primary'
              : isDark
                ? 'bg-background-secondary-dark border-transparent'
                : 'bg-background-secondary-light border-transparent'
          }`}
          onPress={() => setPeriod('month')}
        >
          <Ionicons
            name="calendar-outline"
            size={18}
            color={(period === 'month' || period === 'custom') ? '#007AFF' : (isDark ? '#A0AEC0' : '#4A5568')}
          />
          <Text className={`text-[13px] font-semibold ${
            (period === 'month' || period === 'custom')
              ? 'text-primary'
              : isDark
                ? 'text-text-secondary-dark'
                : 'text-text-secondary-light'
          }`}>
            Mese
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 flex-row items-center justify-center gap-1 py-3 rounded-xl border-[1.5px] ${
            period === 'year'
              ? 'bg-primary/20 border-primary'
              : isDark
                ? 'bg-background-secondary-dark border-transparent'
                : 'bg-background-secondary-light border-transparent'
          }`}
          onPress={() => setPeriod('year')}
        >
          <Ionicons
            name="calendar-number"
            size={18}
            color={period === 'year' ? '#007AFF' : (isDark ? '#A0AEC0' : '#4A5568')}
          />
          <Text className={`text-[13px] font-semibold ${
            period === 'year'
              ? 'text-primary'
              : isDark
                ? 'text-text-secondary-dark'
                : 'text-text-secondary-light'
          }`}>
            Anno
          </Text>
        </TouchableOpacity>
      </View>

      {/* Active Filters */}
      {(selectedCategory || period === 'custom' || selectedType !== 'all' || minAmount !== null || maxAmount !== null) && (
        <View className="pb-3">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="px-4 gap-2"
          >
            {selectedCategory && (
              <View className="flex-row items-center gap-1 bg-primary/20 px-3 py-2 rounded-full border border-primary">
                <Ionicons name="pricetag" size={14} color="#007AFF" />
                <Text className="text-[13px] font-semibold text-primary">
                  {selectedCategory}
                </Text>
                <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                  <Ionicons name="close-circle" size={16} color="#007AFF" />
                </TouchableOpacity>
              </View>
            )}
            {period === 'custom' && (
              <View className="flex-row items-center gap-1 bg-primary/20 px-3 py-2 rounded-full border border-primary">
                <Ionicons name="calendar" size={14} color="#007AFF" />
                <Text className="text-[13px] font-semibold text-primary">
                  {months[selectedMonth]} {selectedYear}
                </Text>
                <TouchableOpacity onPress={() => setPeriod('month')}>
                  <Ionicons name="close-circle" size={16} color="#007AFF" />
                </TouchableOpacity>
              </View>
            )}
            {selectedType !== 'all' && (
              <View className="flex-row items-center gap-1 bg-primary/20 px-3 py-2 rounded-full border border-primary">
                <Ionicons name={selectedType === 'income' ? 'arrow-down' : 'arrow-up'} size={14} color="#007AFF" />
                <Text className="text-[13px] font-semibold text-primary">
                  {selectedType === 'income' ? 'Entrate' : 'Spese'}
                </Text>
                <TouchableOpacity onPress={() => setSelectedType('all')}>
                  <Ionicons name="close-circle" size={16} color="#007AFF" />
                </TouchableOpacity>
              </View>
            )}
            {minAmount !== null && (
              <View className="flex-row items-center gap-1 bg-primary/20 px-3 py-2 rounded-full border border-primary">
                <Ionicons name="chevron-up" size={14} color="#007AFF" />
                <Text className="text-[13px] font-semibold text-primary">
                  Min €{minAmount}
                </Text>
                <TouchableOpacity onPress={() => setMinAmount(null)}>
                  <Ionicons name="close-circle" size={16} color="#007AFF" />
                </TouchableOpacity>
              </View>
            )}
            {maxAmount !== null && (
              <View className="flex-row items-center gap-1 bg-primary/20 px-3 py-2 rounded-full border border-primary">
                <Ionicons name="chevron-down" size={14} color="#007AFF" />
                <Text className="text-[13px] font-semibold text-primary">
                  Max €{maxAmount}
                </Text>
                <TouchableOpacity onPress={() => setMaxAmount(null)}>
                  <Ionicons name="close-circle" size={16} color="#007AFF" />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* Error */}
      {error && (
        <View className="flex-row items-center bg-warning/20 px-4 py-3 mx-4 mb-4 rounded-xl gap-2">
          <Ionicons name="alert-circle" size={20} color="#F59E0B" />
          <Text className="flex-1 text-warning text-sm">{error}</Text>
        </View>
      )}

      {/* Dashboard */}
      <AnalyticsDashboard data={data} loading={loading} />

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowFilters(false)}
      >
        <SafeAreaView
          className={`flex-1 ${isDark ? 'bg-background-primary-dark' : 'bg-background-primary-light'}`}
          edges={['top', 'left', 'right', 'bottom']}
        >
          <View className={`flex-row justify-between items-center px-4 py-3 border-b ${
            isDark ? 'border-border-dark' : 'border-border-light'
          }`}>
            <Text className={`text-2xl font-bold ${
              isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
            }`}>
              Filtri
            </Text>
            <TouchableOpacity
              className={`w-10 h-10 rounded-xl items-center justify-center ${
                isDark ? 'bg-background-secondary-dark' : 'bg-background-secondary-light'
              }`}
              onPress={() => setShowFilters(false)}
            >
              <Ionicons
                name="close"
                size={24}
                color={isDark ? '#FFFFFF' : '#1A202C'}
              />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Tipo di Transazione */}
            <View className="px-4 pt-6">
              <Text className={`text-base font-bold mb-3 ${
                isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
              }`}>
                Tipo di Transazione
              </Text>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  className={`flex-1 py-3 rounded-xl items-center border-[1.5px] ${
                    selectedType === 'all'
                      ? 'bg-primary/20 border-primary'
                      : isDark
                        ? 'bg-background-card-dark border-transparent'
                        : 'bg-background-card-light border-transparent shadow-sm'
                  }`}
                  onPress={() => setSelectedType('all')}
                >
                  <Ionicons
                    name="apps"
                    size={20}
                    color={selectedType === 'all' ? '#007AFF' : (isDark ? '#A0AEC0' : '#6B7280')}
                  />
                  <Text className={`text-[13px] font-semibold mt-1 ${
                    selectedType === 'all'
                      ? 'text-primary'
                      : isDark
                        ? 'text-text-secondary-dark'
                        : 'text-text-secondary-light'
                  }`}>
                    Tutte
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-3 rounded-xl items-center border-[1.5px] ${
                    selectedType === 'income'
                      ? 'bg-success/20 border-success'
                      : isDark
                        ? 'bg-background-card-dark border-transparent'
                        : 'bg-background-card-light border-transparent shadow-sm'
                  }`}
                  onPress={() => setSelectedType('income')}
                >
                  <Ionicons
                    name="arrow-down"
                    size={20}
                    color={selectedType === 'income' ? '#10B981' : (isDark ? '#A0AEC0' : '#6B7280')}
                  />
                  <Text className={`text-[13px] font-semibold mt-1 ${
                    selectedType === 'income'
                      ? 'text-success'
                      : isDark
                        ? 'text-text-secondary-dark'
                        : 'text-text-secondary-light'
                  }`}>
                    Entrate
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-3 rounded-xl items-center border-[1.5px] ${
                    selectedType === 'expense'
                      ? 'bg-error/20 border-error'
                      : isDark
                        ? 'bg-background-card-dark border-transparent'
                        : 'bg-background-card-light border-transparent shadow-sm'
                  }`}
                  onPress={() => setSelectedType('expense')}
                >
                  <Ionicons
                    name="arrow-up"
                    size={20}
                    color={selectedType === 'expense' ? '#EF4444' : (isDark ? '#A0AEC0' : '#6B7280')}
                  />
                  <Text className={`text-[13px] font-semibold mt-1 ${
                    selectedType === 'expense'
                      ? 'text-error'
                      : isDark
                        ? 'text-text-secondary-dark'
                        : 'text-text-secondary-light'
                  }`}>
                    Spese
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Range Importo */}
            <View className="px-4 pt-6">
              <Text className={`text-base font-bold mb-3 ${
                isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
              }`}>
                Range Importo (€)
              </Text>
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className={`text-sm font-semibold mb-2 ${
                    isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'
                  }`}>
                    Minimo
                  </Text>
                  <View className="flex-row gap-2">
                    {[10, 50, 100, 500].map((amount) => (
                      <TouchableOpacity
                        key={amount}
                        className={`flex-1 py-2.5 rounded-lg items-center border-[1.5px] ${
                          minAmount === amount
                            ? 'bg-primary/20 border-primary'
                            : isDark
                              ? 'bg-background-card-dark border-transparent'
                              : 'bg-background-card-light border-transparent shadow-sm'
                        }`}
                        onPress={() => setMinAmount(minAmount === amount ? null : amount)}
                      >
                        <Text className={`text-xs font-semibold ${
                          minAmount === amount
                            ? 'text-primary'
                            : isDark
                              ? 'text-text-secondary-dark'
                              : 'text-text-secondary-light'
                        }`}>
                          {amount}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View className="flex-1">
                  <Text className={`text-sm font-semibold mb-2 ${
                    isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'
                  }`}>
                    Massimo
                  </Text>
                  <View className="flex-row gap-2">
                    {[100, 500, 1000, 5000].map((amount) => (
                      <TouchableOpacity
                        key={amount}
                        className={`flex-1 py-2.5 rounded-lg items-center border-[1.5px] ${
                          maxAmount === amount
                            ? 'bg-primary/20 border-primary'
                            : isDark
                              ? 'bg-background-card-dark border-transparent'
                              : 'bg-background-card-light border-transparent shadow-sm'
                        }`}
                        onPress={() => setMaxAmount(maxAmount === amount ? null : amount)}
                      >
                        <Text className={`text-xs font-semibold ${
                          maxAmount === amount
                            ? 'text-primary'
                            : isDark
                              ? 'text-text-secondary-dark'
                              : 'text-text-secondary-light'
                        }`}>
                          {amount >= 1000 ? `${amount/1000}k` : amount}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>

            {/* Selezione Mese */}
            <View className="px-4 pt-6">
              <Text className={`text-base font-bold mb-3 ${
                isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
              }`}>
                Seleziona Mese
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {months.map((month, index) => (
                  <TouchableOpacity
                    key={month}
                    className={`w-[22%] py-3 rounded-xl items-center border-[1.5px] ${
                      selectedMonth === index && period === 'custom'
                        ? 'bg-primary/20 border-primary'
                        : isDark
                          ? 'bg-background-card-dark border-transparent'
                          : 'bg-background-card-light border-transparent shadow-sm'
                    }`}
                    onPress={() => handleMonthSelect(index)}
                  >
                    <Text className={`text-[13px] font-semibold ${
                      selectedMonth === index && period === 'custom'
                        ? 'text-primary'
                        : isDark
                          ? 'text-text-secondary-dark'
                          : 'text-text-secondary-light'
                    }`}>
                      {month.substring(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Selezione Anno */}
            <View className="px-4 pt-6">
              <Text className={`text-base font-bold mb-3 ${
                isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
              }`}>
                Seleziona Anno
              </Text>
              <View className="flex-row gap-2">
                {years.map((year) => (
                  <TouchableOpacity
                    key={year}
                    className={`flex-1 py-3 rounded-xl items-center border-[1.5px] ${
                      selectedYear === year && period === 'custom'
                        ? 'bg-primary/20 border-primary'
                        : isDark
                          ? 'bg-background-card-dark border-transparent'
                          : 'bg-background-card-light border-transparent shadow-sm'
                    }`}
                    onPress={() => handleYearSelect(year)}
                  >
                    <Text className={`text-base font-semibold ${
                      selectedYear === year && period === 'custom'
                        ? 'text-primary'
                        : isDark
                          ? 'text-text-secondary-dark'
                          : 'text-text-secondary-light'
                    }`}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Filtra per Categoria */}
            <View className="px-4 pt-6">
              <Text className={`text-base font-bold mb-3 ${
                isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
              }`}>
                Filtra per Categoria
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    className={`px-4 py-3 rounded-full border-[1.5px] ${
                      (cat === 'Tutte' ? !selectedCategory : selectedCategory === cat)
                        ? 'bg-primary/20 border-primary'
                        : isDark
                          ? 'bg-background-card-dark border-transparent'
                          : 'bg-background-card-light border-transparent shadow-sm'
                    }`}
                    onPress={() => handleCategorySelect(cat)}
                  >
                    <Text className={`text-[13px] font-semibold ${
                      (cat === 'Tutte' ? !selectedCategory : selectedCategory === cat)
                        ? 'text-primary'
                        : isDark
                          ? 'text-text-secondary-dark'
                          : 'text-text-secondary-light'
                    }`}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="h-8" />
          </ScrollView>

          {/* Apply Button */}
          <View className={`flex-row gap-3 px-4 py-4 border-t ${
            isDark ? 'border-border-dark' : 'border-border-light'
          }`}>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-xl items-center ${
                isDark ? 'bg-background-secondary-dark' : 'bg-background-secondary-light'
              }`}
              onPress={() => {
                setPeriod('month');
                setSelectedCategory(null);
                setSelectedType('all');
                setMinAmount(null);
                setMaxAmount(null);
                setSelectedMonth(new Date().getMonth());
                setSelectedYear(new Date().getFullYear());
              }}
            >
              <Text className={`text-base font-bold ${
                isDark ? 'text-text-primary-dark' : 'text-text-primary-light'
              }`}>
                Reset Filtri
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-[2] py-3 bg-primary rounded-xl items-center"
              onPress={() => setShowFilters(false)}
            >
              <Text className="text-base font-bold text-white">
                Applica
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};
